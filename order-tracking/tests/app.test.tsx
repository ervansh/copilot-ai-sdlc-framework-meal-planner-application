import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../src/App'
import { BUNDLED_ORDER_CATALOGUE } from '../src/catalogue/bundled-catalogue'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  if (root) act(() => root?.unmount())
  container?.remove()
  root = undefined
  container = undefined
})

const renderApp = () => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(<App catalogue={BUNDLED_ORDER_CATALOGUE} />))
  return container
}

const setInputValue = (input: HTMLInputElement, value: string): void => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const submit = (form: HTMLFormElement): void => {
  act(() => form.requestSubmit())
}

describe('guest lookup view', () => {
  it('provides labeled fields and associated required feedback', () => {
    const view = renderApp()
    const form = view.querySelector('form')!
    submit(form)

    const orderNumber = view.querySelector<HTMLInputElement>('#order-number')!
    const emailAddress = view.querySelector<HTMLInputElement>('#email-address')!
    expect(orderNumber.getAttribute('aria-invalid')).toBe('true')
    expect(orderNumber.getAttribute('aria-describedby')).toBe('order-number-error')
    expect(emailAddress.getAttribute('aria-describedby')).toBe('email-address-error')
    expect(view.textContent).toContain('Enter your order number.')
    expect(view.textContent).toContain('Enter your email address.')
    expect(document.activeElement).toBe(orderNumber)
  })

  it('submits normalized identifiers and renders only approved tracking fields', () => {
    const view = renderApp()
    setInputValue(view.querySelector<HTMLInputElement>('#order-number')!, ' ord-1001 ')
    setInputValue(view.querySelector<HTMLInputElement>('#email-address')!, ' ALEX.RIVER@EXAMPLE.TEST ')
    submit(view.querySelector('form')!)

    expect(view.textContent).toContain('Order ORD-1001')
    expect(view.textContent).toContain('In transit')
    expect(view.textContent).toContain('Last updated')
    expect(view.textContent).not.toContain('alex.river@example.test')
    expect(view.textContent).not.toContain('emailAddress')
  })

  it('shows one generic failure and clears an earlier successful result', () => {
    const view = renderApp()
    setInputValue(view.querySelector<HTMLInputElement>('#order-number')!, 'ORD-1001')
    setInputValue(view.querySelector<HTMLInputElement>('#email-address')!, 'alex.river@example.test')
    submit(view.querySelector('form')!)
    expect(view.textContent).toContain('Order ORD-1001')

    setInputValue(view.querySelector<HTMLInputElement>('#email-address')!, 'wrong@example.test')
    submit(view.querySelector('form')!)
    expect(view.textContent).toContain('We could not validate those order details.')
    expect(view.textContent).not.toContain('Order ORD-1001')
    expect(view.textContent).not.toContain('In transit')
  })
})