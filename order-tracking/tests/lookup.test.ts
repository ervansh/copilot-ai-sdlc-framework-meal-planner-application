import { describe, expect, it } from 'vitest'
import { BUNDLED_ORDER_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import {
  GENERIC_LOOKUP_FAILURE,
  lookupOrder,
  validateLookupInput,
} from '../src/domain/lookup'

describe('order lookup domain', () => {
  it('reports each missing required field before catalogue lookup', () => {
    expect(validateLookupInput({ orderNumber: '  ', emailAddress: '' })).toEqual({
      orderNumber: 'Enter your order number.',
      emailAddress: 'Enter your email address.',
    })
    expect(lookupOrder({ orderNumber: '  ', emailAddress: '' })).toEqual({
      kind: 'validation-error',
      errors: {
        orderNumber: 'Enter your order number.',
        emailAddress: 'Enter your email address.',
      },
    })
  })

  it('trims and compares both identifiers case-insensitively', () => {
    expect(
      lookupOrder({
        orderNumber: '  ord-1001 ',
        emailAddress: ' ALEX.RIVER@EXAMPLE.TEST ',
      }),
    ).toEqual({
      kind: 'success',
      result: {
        orderNumber: 'ORD-1001',
        status: 'In transit',
        lastUpdated: '2026-09-20T14:30:00.000Z',
      },
    })
  })

  it('requires both normalized identifiers to match the same record', () => {
    const outcomes = [
      lookupOrder({ orderNumber: 'ORD-9999', emailAddress: 'alex.river@example.test' }),
      lookupOrder({ orderNumber: 'ORD-1001', emailAddress: 'missing@example.test' }),
      lookupOrder({ orderNumber: 'ORD-1001', emailAddress: 'sam.park@example.test' }),
    ]

    expect(outcomes).toEqual([
      { kind: 'not-found-or-not-validated', message: GENERIC_LOOKUP_FAILURE },
      { kind: 'not-found-or-not-validated', message: GENERIC_LOOKUP_FAILURE },
      { kind: 'not-found-or-not-validated', message: GENERIC_LOOKUP_FAILURE },
    ])
  })

  it('returns only the approved tracking fields on success', () => {
    const outcome = lookupOrder({
      orderNumber: 'ORD-1002',
      emailAddress: 'sam.park@example.test',
    })

    expect(outcome.kind).toBe('success')
    if (outcome.kind === 'success') {
      expect(Object.keys(outcome.result).sort()).toEqual([
        'lastUpdated',
        'orderNumber',
        'status',
      ])
    }
  })

  it('completes a normal bundled lookup in under one second', () => {
    const startedAt = performance.now()
    const outcome = lookupOrder({
      orderNumber: 'ORD-1001',
      emailAddress: 'alex.river@example.test',
    })
    const elapsedMilliseconds = performance.now() - startedAt

    expect(outcome.kind).toBe('success')
    expect(elapsedMilliseconds).toBeLessThan(1000)
  })

  it('does not expose catalogue records through a failed outcome', () => {
    const outcome = lookupOrder(
      { orderNumber: 'ORD-1001', emailAddress: 'wrong@example.test' },
      BUNDLED_ORDER_CATALOGUE,
    )

    expect(outcome).toEqual({
      kind: 'not-found-or-not-validated',
      message: GENERIC_LOOKUP_FAILURE,
    })
    expect(JSON.stringify(outcome)).not.toContain('emailAddress')
    expect(JSON.stringify(outcome)).not.toContain('status')
  })
})