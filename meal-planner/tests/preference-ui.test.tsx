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

const setInputValue = (input: HTMLInputElement, value: string): void => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const planState = async () => {
  const preferences = validatePreferences({ dietType: 'VEGAN' }).preferences!
  const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences)
  if (!result.success) throw new Error(result.message)
  return createCoordinatorState(preferences, result.plan, result.plan)
}

describe('preference and confirmation UI', () => {
  it('supports diet selection and allergen selection', async () => {
    const container = await renderApp()
    const vegetarian = container.querySelector<HTMLInputElement>('input[value="VEGETARIAN"]')!
    const nuts = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')][0]
    await act(async () => { vegetarian.click(); nuts.click() })
    expect(vegetarian.checked).toBe(true)
    expect(nuts.checked).toBe(true)
  })

  it('adds, trims, de-duplicates, and removes exclusions', async () => {
    const container = await renderApp()
    const input = container.querySelector<HTMLInputElement>('#excluded-ingredient')!
    const add = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Add')!
    await act(async () => { setInputValue(input, '  Tomato  '); add.click() })
    expect(container.textContent).toContain('tomato')
    await act(async () => { setInputValue(input, 'TOMATO'); add.click() })
    expect(container.querySelectorAll('.exclusion-list li')).toHaveLength(1)
    const remove = container.querySelector<HTMLButtonElement>('.exclusion-list button')!
    await act(async () => { remove.click() })
    expect(container.querySelector('.exclusion-list')).toBeNull()
  })

  it('shows blank exclusion validation and stale-plan messaging', async () => {
    const state = await planState()
    const container = await renderApp(state)
    const input = container.querySelector<HTMLInputElement>('#excluded-ingredient')!
    const add = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Add')!
    await act(async () => { setInputValue(input, ' '); add.click() })
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('cannot be blank')
    await act(async () => { setInputValue(input, 'oat'); add.click() })
    expect(container.textContent).toContain('Plan uses older preferences')
    expect(container.textContent).toContain('Apple Cinnamon Oats')
  })

  it('shows save-over-existing and regeneration confirmations, with cancellation', async () => {
    const container = await renderApp(await planState())
    const save = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Save plan')!
    await act(async () => { save.click() })
    const saveAgain = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Save plan')!
    await act(async () => { saveAgain.click() })
    expect(container.textContent).toContain('Replace the saved plan?')
    const cancel = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Cancel')!
    await act(async () => { cancel.click() })
    expect(container.textContent).not.toContain('Replace the saved plan?')
  })

  it('does not add confirmation before individual meal replacement', async () => {
    const container = await renderApp(await planState())
    expect(container.textContent).toContain('Replace meal')
    expect(container.textContent).not.toContain('Confirm replacement')
  })
})