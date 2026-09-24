import { BUNDLED_ORDER_CATALOGUE } from '../catalogue/bundled-catalogue'
import type { OrderCatalogue, TrackingResult } from './catalogue'

export type LookupInput = {
  readonly orderNumber: string
  readonly emailAddress: string
}

export type LookupField = keyof LookupInput

export type LookupValidation = {
  readonly orderNumber?: string
  readonly emailAddress?: string
}

export type ValidationFailure = {
  readonly kind: 'validation-error'
  readonly errors: LookupValidation
}

export type NotFoundFailure = {
  readonly kind: 'not-found-or-not-validated'
  readonly message: 'We could not validate those order details.'
}

export type LookupSuccess = {
  readonly kind: 'success'
  readonly result: TrackingResult
}

export type LookupOutcome = LookupSuccess | ValidationFailure | NotFoundFailure

export const GENERIC_LOOKUP_FAILURE = 'We could not validate those order details.'

export function validateLookupInput(input: LookupInput): LookupValidation {
  const errors: { orderNumber?: string; emailAddress?: string } = {}

  if (!input.orderNumber.trim()) {
    errors.orderNumber = 'Enter your order number.'
  }

  if (!input.emailAddress.trim()) {
    errors.emailAddress = 'Enter your email address.'
  }

  return errors
}

function normalizeOrderNumber(orderNumber: string): string {
  return orderNumber.trim().toLowerCase()
}

function normalizeEmailAddress(emailAddress: string): string {
  return emailAddress.trim().toLowerCase()
}

export function lookupOrder(
  input: LookupInput,
  catalogue: OrderCatalogue = BUNDLED_ORDER_CATALOGUE,
): LookupOutcome {
  const validationErrors = validateLookupInput(input)

  if (Object.keys(validationErrors).length > 0) {
    return { kind: 'validation-error', errors: validationErrors }
  }

  const normalizedOrderNumber = normalizeOrderNumber(input.orderNumber)
  const normalizedEmailAddress = normalizeEmailAddress(input.emailAddress)
  const match = catalogue.find(
    (record) =>
      normalizeOrderNumber(record.orderNumber) === normalizedOrderNumber &&
      normalizeEmailAddress(record.emailAddress) === normalizedEmailAddress,
  )

  if (!match) {
    return {
      kind: 'not-found-or-not-validated',
      message: GENERIC_LOOKUP_FAILURE,
    }
  }

  return {
    kind: 'success',
    result: {
      orderNumber: match.orderNumber,
      status: match.status,
      lastUpdated: match.lastUpdated,
    },
  }
}