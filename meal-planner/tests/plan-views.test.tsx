import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../src/App'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { createCoordinatorState } from '../src/domain/coordinator'
import { generateWeeklyPlan } from '../src/domain/generation'
import { validatePreferences } from '../src/domain/preferences'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  if (root) act(() => root?.unmount())
  container?.remove()
  root = undefined
  container = undefined
})

const renderApp = async (state?: Parameters<typeof App>[0]['state']) => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => { root?.render(<App state={state} />) })
  return container
}

const createPlanState = async () => {
  const preferences = validatePreferences({ dietType: 'VEGAN' }).preferences!
  const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences)
  if (!result.success) throw new Error(result.message)
  return createCoordinatorState(preferences, result.plan, result.plan)
}

describe('weekly, daily, and recipe-detail views', () => {
  it('renders seven days and all three meal types with domain recipe mapping', async () => {
    const container = await renderApp(await createPlanState())

    expect(container.querySelectorAll('.day-card')).toHaveLength(7)
    expect(container.querySelectorAll('.meal-row')).toHaveLength(21)
    expect(container.textContent).toContain('Breakfast')
    expect(container.textContent).toContain('Lunch')
    expect(container.textContent).toContain('Dinner')
    expect(container.textContent).toContain('Apple Cinnamon Oats')
  })

  it('updates the daily view when a day is selected without changing plan data', async () => {
    const state = await createPlanState()
    const assignmentsBefore = structuredClone(state.displayedPlan!.assignments)
    const container = await renderApp(state)
    const dayButtons = container.querySelectorAll<HTMLButtonElement>('.day-heading')

    await act(async () => { dayButtons[3].click() })

    expect(container.querySelector('.detail-panel h2')?.textContent).toBe('Thursday')
    expect(state.displayedPlan?.assignments).toEqual(assignmentsBefore)
  })

  it('shows selected assignment details from the catalogue', async () => {
    const container = await renderApp(await createPlanState())
    const mealButton = container.querySelector<HTMLButtonElement>('.meal-row')!

    await act(async () => { mealButton.click() })

    expect(container.querySelector('#recipe-title')?.textContent).toBe('Apple Cinnamon Oats')
    expect(container.textContent).toContain('Rolled oats')
    expect(container.textContent).toContain('Prepare the ingredients and serve the apple cinnamon oats.')
    expect(container.textContent).toContain('20 minutes')
    expect(container.textContent).toContain('1 serving')
    expect(container.textContent).not.toContain('calories')
  })

  it('renders the approved empty state without an active plan', async () => {
    const container = await renderApp()

    expect(container.querySelector('#empty-title')?.textContent).toBe('No active plan yet')
    expect(container.querySelectorAll('.day-card')).toHaveLength(0)
  })

  it('renders coordinator error messages without inventing eligibility rules', async () => {
    const state = await createPlanState()
    const withError = { ...state, error: { code: 'restore-failed', message: 'Saved plan could not be restored.' } }
    const container = await renderApp(withError)

    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Saved plan could not be restored.')
    expect(container.textContent).not.toContain('eligible')
  })
})