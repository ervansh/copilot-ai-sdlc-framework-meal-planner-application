import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { BUNDLED_ORDER_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { orderSummaryAdapter } from '../src/domain/order-summary-adapter'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  if (root) act(() => root?.unmount())
  container?.remove()
  vi.restoreAllMocks()
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
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
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

  it('renders customer-readable summary content in distinct, labeled sections', () => {
    const view = renderApp()
    setInputValue(view.querySelector<HTMLInputElement>('#order-number')!, 'ORD-1001')
    setInputValue(view.querySelector<HTMLInputElement>('#email-address')!, 'alex.river@example.test')
    submit(view.querySelector('form')!)

    const summary = view.querySelector<HTMLElement>('article[aria-labelledby="summary-title"]')!
    const summaryTitle = summary.querySelector('#summary-title')!
    expect(summaryTitle.textContent).toBe('Order ORD-1001')

    const statusSection = summary.querySelector<HTMLElement>('section[aria-labelledby="current-order-status"]')!
    const orderDetails = summary.querySelector<HTMLElement>('section[aria-labelledby="order-details-title"]')!
    const shipmentDetails = summary.querySelector<HTMLElement>('section[aria-labelledby="shipment-delivery-title"]')!
    expect(statusSection.querySelector('h3')?.textContent).toBe('Current order status')
    expect(statusSection.textContent).toContain('In transit')
    expect(orderDetails.querySelector('h3')?.textContent).toBe('Order details')
    expect(orderDetails.textContent).toContain('Sep 20, 2026')
    expect(orderDetails.textContent).toContain('Order items')
    expect(orderDetails.textContent).toContain('1 item')
    expect(orderDetails.textContent).toContain('Processing fulfillment')
    expect(shipmentDetails.querySelector('h3')?.textContent).toBe('Shipment and delivery')
    expect(shipmentDetails.textContent).toContain('Shipment in progress')
    expect(shipmentDetails.textContent).toContain('Sep 25, 2026')
    expect(statusSection.textContent).not.toContain('Shipment in progress')
    expect(statusSection.textContent).not.toContain('Sep 25, 2026')
    expect(summary.textContent).not.toMatch(/IN_TRANSIT|PROCESSING/)
  })

  it('keeps the summary accessible and usable when optional values are missing', () => {
    const adaptOrderToSummary = orderSummaryAdapter.adapt
    vi.spyOn(orderSummaryAdapter, 'adapt').mockImplementation((order) => {
      const summary = adaptOrderToSummary(order)
      return {
        ...summary,
        orderDate: undefined,
        fulfillmentState: undefined,
        shipmentInfo: undefined,
        estimatedDelivery: undefined,
      }
    })

    const view = renderApp()
    setInputValue(view.querySelector<HTMLInputElement>('#order-number')!, 'ORD-1001')
    setInputValue(view.querySelector<HTMLInputElement>('#email-address')!, 'alex.river@example.test')
    submit(view.querySelector('form')!)

    const main = view.querySelector('main')!
    const liveRegion = view.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')!
    const summary = view.querySelector<HTMLElement>('article[aria-labelledby="summary-title"]')!
    expect(main.querySelector('h1')?.textContent).toBe('Track your order')
    expect(liveRegion.contains(summary)).toBe(true)
    expect(summary.querySelector('#summary-title')?.textContent).toBe('Order ORD-1001')
    expect(summary.querySelector('#current-order-status')?.nextElementSibling?.textContent).toBe('In transit')
    expect(summary.textContent).toContain('Order items')
    expect(summary.textContent).toContain('1 item')
    expect(summary.textContent).toContain('Not available')
  })
})