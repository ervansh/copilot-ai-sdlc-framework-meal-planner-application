import { describe, expect, it } from 'vitest'
import { adaptOrderToSummary } from '../src/domain/order-summary'

describe('order summary view model', () => {
  it('maps an identified order to the approved customer-safe summary contract', () => {
    const summary = adaptOrderToSummary({
      orderIdentifier: 'ORD-2048',
      orderDate: '2026-09-01T00:00:00.000Z',
      status: 'IN_TRANSIT',
      items: [{ name: 'Wireless Mouse', quantity: 1 }],
      quantitySummary: '1 item',
      fulfillmentState: 'PARTIALLY_FULFILLED',
      shipmentInfo: 'UPS Ground • Tracking 1Z999',
      estimatedDelivery: '2026-09-04T00:00:00.000Z',
    })

    expect(summary).toEqual({
      orderIdentifier: 'ORD-2048',
      orderDate: 'Sep 1, 2026',
      orderStatus: 'In transit',
      itemSummary: 'Wireless Mouse',
      quantitySummary: '1 item',
      fulfillmentState: 'Partially fulfilled',
      shipmentInfo: 'UPS Ground • Tracking 1Z999',
      estimatedDelivery: 'Sep 4, 2026',
    })
  })

  it('gracefully ignores missing optional values without breaking the summary', () => {
    const summary = adaptOrderToSummary({
      orderIdentifier: 'ORD-2049',
      status: 'DELIVERED',
      itemSummary: 'Mechanical keyboard',
    })

    expect(summary.orderIdentifier).toBe('ORD-2049')
    expect(summary.orderStatus).toBe('Delivered')
    expect(summary.itemSummary).toBe('Mechanical keyboard')
    expect(summary.orderDate).toBeUndefined()
    expect(summary.shipmentInfo).toBeUndefined()
    expect(summary.estimatedDelivery).toBeUndefined()
  })

  it('converts raw internal statuses and fulfillment values to readable labels', () => {
    expect(adaptOrderToSummary({ orderIdentifier: 'ORD-2050', status: 'PENDING' }).orderStatus).toBe('Pending')
    expect(adaptOrderToSummary({ orderIdentifier: 'ORD-2051', fulfillmentState: 'FULFILLED' }).fulfillmentState).toBe('Fulfilled')
  })
})
