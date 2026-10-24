export type OrderSummaryViewModel = {
  readonly orderIdentifier: string
  readonly orderDate?: string
  readonly orderStatus?: string
  readonly itemSummary?: string
  readonly quantitySummary?: string
  readonly fulfillmentState?: string
  readonly shipmentInfo?: string
  readonly estimatedDelivery?: string
}

export type OrderItemSummary = {
  readonly name?: string | null
  readonly quantity?: number | string | null
}

export type OrderSummaryInput = {
  readonly orderIdentifier?: string | null
  readonly orderDate?: string | null
  readonly status?: string | null
  readonly itemSummary?: string | null
  readonly quantitySummary?: string | null
  readonly fulfillmentState?: string | null
  readonly shipmentInfo?: string | null
  readonly estimatedDelivery?: string | null
  readonly items?: readonly (string | OrderItemSummary | null | undefined)[] | null
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In transit',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
  CANCELED: 'Cancelled',
  HOLD: 'On hold',
}

const FULFILLMENT_LABELS: Record<string, string> = {
  PENDING: 'Pending fulfillment',
  PARTIALLY_FULFILLED: 'Partially fulfilled',
  FULFILLED: 'Fulfilled',
  PROCESSING: 'Processing fulfillment',
}

const normalizeOptionalText = (value: string | null | undefined): string | undefined => {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

const formatDate = (value: string | null | undefined): string | undefined => {
  const normalized = normalizeOptionalText(value)
  if (!normalized) return undefined

  const parsedDate = new Date(normalized)
  if (Number.isNaN(parsedDate.getTime())) return normalized

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate)
}

const toCustomerLabel = (value: string | null | undefined, labelMap: Record<string, string>): string | undefined => {
  const normalized = normalizeOptionalText(value)
  if (!normalized) return undefined

  const key = normalized.toUpperCase().replace(/\s+/g, '_')
  return labelMap[key] ?? normalized
}

const deriveItemSummary = (order: OrderSummaryInput): string | undefined => {
  const explicitItemSummary = normalizeOptionalText(order.itemSummary)
  if (explicitItemSummary) return explicitItemSummary

  const items = order.items ?? []
  if (items.length === 0) return undefined

  const names = items
    .map((item) => {
      if (typeof item === 'string') return normalizeOptionalText(item)
      if (!item) return undefined
      return normalizeOptionalText(item.name ?? undefined)
    })
    .filter((name): name is string => Boolean(name))

  return names.length > 0 ? names.join(', ') : undefined
}

const deriveQuantitySummary = (order: OrderSummaryInput): string | undefined => {
  const explicitQuantity = normalizeOptionalText(order.quantitySummary)
  if (explicitQuantity) return explicitQuantity

  const items = order.items ?? []
  if (items.length === 0) return undefined

  const totalQuantity = items.reduce((total, item) => {
    if (typeof item === 'string') return total
    if (!item) return total
    const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity ?? 0)
    return total + (Number.isFinite(quantity) ? quantity : 0)
  }, 0)

  return totalQuantity > 0 ? `${totalQuantity} item${totalQuantity === 1 ? '' : 's'}` : undefined
}

export function adaptOrderToSummary(order: OrderSummaryInput): OrderSummaryViewModel {
  const orderIdentifier = normalizeOptionalText(order.orderIdentifier)

  return {
    orderIdentifier: orderIdentifier ?? '',
    orderDate: formatDate(order.orderDate),
    orderStatus: toCustomerLabel(order.status, ORDER_STATUS_LABELS),
    itemSummary: deriveItemSummary(order),
    quantitySummary: deriveQuantitySummary(order),
    fulfillmentState: toCustomerLabel(order.fulfillmentState, FULFILLMENT_LABELS),
    shipmentInfo: normalizeOptionalText(order.shipmentInfo),
    estimatedDelivery: formatDate(order.estimatedDelivery),
  }
}

export type OrderSummaryAdapter = {
  readonly adaptOrderToSummary: (order: OrderSummaryInput) => OrderSummaryViewModel
  readonly adapt: (order: OrderSummaryInput) => OrderSummaryViewModel
}

export const orderSummaryAdapter: OrderSummaryAdapter = {
  adaptOrderToSummary,
  adapt: adaptOrderToSummary,
}

export default adaptOrderToSummary
