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

const planState = async () => {
  const preferences = validatePreferences({ dietType: 'VEGAN' }).preferences!
  const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences)
  if (!result.success) throw new Error(result.message)
  return createCoordinatorState(preferences, result.plan, result.plan)
}

describe('IMP-012 accessibility and responsive behavior', () => {
  it('provides semantic headings, fieldset legends, labels, and named controls', async () => {
    const container = await renderApp(await planState())

    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelectorAll('h2').length).toBeGreaterThan(1)
    expect(container.querySelectorAll('fieldset')).toHaveLength(3)
    expect([...container.querySelectorAll('legend')].map((legend) => legend.textContent)).toEqual([
      'Diet', 'Allergens to avoid', 'Excluded ingredients',
    ])
    expect(container.querySelector('label[for="excluded-ingredient"]')).not.toBeNull()
    expect([...container.querySelectorAll('button')].every((button) => (button.textContent ?? '').trim() || button.getAttribute('aria-label'))).toBe(true)
  })

  it('supports keyboard activation for preference controls', async () => {
    const container = await renderApp()
    const input = container.querySelector<HTMLInputElement>('#excluded-ingredient')!
    input.focus()
    await act(async () => { input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    expect(document.activeElement).toBe(input)
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('cannot be blank')
  })

  it('announces stale and error states without relying on color alone', async () => {
    const state = await planState()
    const staleState = { ...state, stale: true, error: { code: 'generation-failed', message: 'Generation could not complete.' } }
    const container = await renderApp(staleState)

    expect(container.textContent).toContain('Plan uses older preferences')
    expect(container.querySelector('[role="alert"][aria-live="assertive"]')?.textContent).toContain('Generation could not complete.')
    expect(container.querySelector('.stale-note')?.textContent).toBe('Plan uses older preferences')
  })

  it('focuses confirmation dialogs and returns focus after keyboard cancellation', async () => {
    const container = await renderApp(await planState())
    const save = [...container.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent === 'Save plan')!
    await act(async () => { save.click() })
    await act(async () => { save.click() })

    const dialog = container.querySelector('[role="alertdialog"]')
    const confirm = container.querySelector<HTMLButtonElement>('.confirmation .primary-action')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(confirm)

    const cancel = container.querySelector<HTMLButtonElement>('.confirmation .secondary-action')!
    await act(async () => { cancel.click() })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.activeElement).toBe(save)
  })

  it('uses responsive layout classes that stack core content on narrow screens', async () => {
    const container = await renderApp(await planState())
    expect(container.querySelector('.week-grid')).not.toBeNull()
    expect(container.querySelector('.preferences-panel')).not.toBeNull()
    expect(container.querySelector('.recipe-detail')).not.toBeNull()
    expect(container.querySelector('.confirmation')).toBeNull()
  })
})