export interface OrderRecord {
  readonly orderNumber: string
  readonly emailAddress: string
  readonly status: string
  readonly lastUpdated: string
}

export interface TrackingResult {
  readonly orderNumber: string
  readonly status: string
  readonly lastUpdated: string
}

export type OrderCatalogue = readonly OrderRecord[]

export const TRACKING_RESULT_KEYS = [
  'orderNumber',
  'status',
  'lastUpdated',
] as const satisfies readonly (keyof TrackingResult)[]
