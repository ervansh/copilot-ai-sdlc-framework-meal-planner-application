import type { OrderCatalogue } from '../domain/catalogue'

const syntheticCatalogue = [
  {
    orderNumber: 'ORD-1001',
    emailAddress: 'alex.river@example.test',
    status: 'In transit',
    lastUpdated: '2026-09-20T14:30:00.000Z',
  },
  {
    orderNumber: 'ORD-1002',
    emailAddress: 'sam.park@example.test',
    status: 'Delivered',
    lastUpdated: '2026-09-21T09:15:00.000Z',
  },
] as const satisfies OrderCatalogue

export const BUNDLED_ORDER_CATALOGUE: OrderCatalogue = Object.freeze(
  syntheticCatalogue.map((record) => Object.freeze(record)),
)
