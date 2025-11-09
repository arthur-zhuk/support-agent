export type ShopifyOrder = {
  order_number: string
  financial_status: string
  fulfillment_status: string
  total_price: string
  created_at: string
  line_items: Array<{
    name: string
    quantity: number
    price: string
    id: string
  }>
  shipping_address?: {
    address1?: string
    address2?: string
    city?: string
    province?: string
    zip?: string
    country?: string
  }
  cancelled_at?: string | null
}

export type ShopifyOrderResponse = {
  order: ShopifyOrder
}

export type ShopifyOrdersResponse = {
  orders: ShopifyOrder[]
}

export type ShopifyRefundResponse = {
  refund: {
    id: string
    amount: string
  }
}

export type ShopifyOrderLineItem = {
  name: string
  quantity: number
  price: string
}

export type ShopifyRefundItem = {
  lineItemId: string
  quantity: number
  reason?: string
}

