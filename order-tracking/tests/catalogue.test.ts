import { describe, expect, it } from 'vitest'
import { BUNDLED_ORDER_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import {
  TRACKING_RESULT_KEYS,
  type TrackingResult,
} from '../src/domain/catalogue'

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const publicResult: TrackingResult = {
  orderNumber: 'ORD-1001',
  status: 'In transit',
  lastUpdated: '2026-09-20T14:30:00.000Z',
}

describe('bundled order catalogue', () => {
  it('contains deterministic synthetic records with the approved internal shape', () => {
    expect(BUNDLED_ORDER_CATALOGUE).toHaveLength(2)

    for (const record of BUNDLED_ORDER_CATALOGUE) {
      expect(Object.keys(record).sort()).toEqual([
        'emailAddress',
        'lastUpdated',
        'orderNumber',
        'status',
      ])
      expect(record.orderNumber).toMatch(/^ORD-\d+$/)
      expect(record.emailAddress).toMatch(/@example\.test$/)
      expect(record.lastUpdated).toMatch(ISO_TIMESTAMP)
      expect(Number.isNaN(Date.parse(record.lastUpdated))).toBe(false)
    }
  })

  it('freezes the catalogue and each record at runtime', () => {
    expect(Object.isFrozen(BUNDLED_ORDER_CATALOGUE)).toBe(true)
    for (const record of BUNDLED_ORDER_CATALOGUE) {
      expect(Object.isFrozen(record)).toBe(true)
    }
  })

  it('keeps the public tracking contract limited to approved fields', () => {
    expect(TRACKING_RESULT_KEYS).toEqual(['orderNumber', 'status', 'lastUpdated'])
    expect(Object.keys(publicResult).sort()).toEqual([...TRACKING_RESULT_KEYS].sort())
    expect(publicResult).not.toHaveProperty('emailAddress')
    expect(publicResult).not.toHaveProperty('customerName')
    expect(publicResult).not.toHaveProperty('phoneNumber')
    expect(publicResult).not.toHaveProperty('postalAddress')
    expect(publicResult).not.toHaveProperty('paymentInformation')
  })
})
