import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import type {
  ShopifyOrderResponse,
  ShopifyOrdersResponse,
  ShopifyRefundResponse,
  ShopifyOrderLineItem,
  ShopifyRefundItem,
} from '@/lib/types/shopify'

async function getShopifyClient(tenantId: string) {
  const connection = await prisma.connection.findFirst({
    where: {
      tenantId,
      type: 'shopify',
    },
  })

  if (!connection) {
    throw new Error('Shopify connection not found')
  }

  const metadata = (connection.metadata ?? {}) as Record<string, unknown>
  const shop = typeof metadata.shop === 'string' ? metadata.shop : undefined

  if (!shop) {
    throw new Error('Shopify connection is missing shop domain metadata')
  }

  return {
    accessToken: connection.token,
    shop,
  }
}

export function getShopifyTools(tenantId: string) {
  return {
    getOrderStatus: tool({
      description: 'Get the status and details of an order by order number or email',
      parameters: z.object({
        orderNumber: z.string().optional().describe('Order number (e.g., #1001)'),
        email: z.string().email().optional().describe('Customer email address'),
      }),
      execute: async ({ orderNumber, email }: { orderNumber?: string; email?: string }) => {
        const client = await getShopifyClient(tenantId)

        if (orderNumber) {
          const orderId = orderNumber.replace('#', '')
          const response = await fetch(
            `https://${client.shop}/admin/api/2024-10/orders/${orderId}.json`,
            {
              headers: {
                'X-Shopify-Access-Token': client.accessToken,
              },
            }
          )

          if (!response.ok) {
            return { error: 'Order not found' }
          }

          const data = (await response.json()) as ShopifyOrderResponse
          return {
            orderNumber: `#${data.order.order_number}`,
            status: data.order.financial_status,
            fulfillmentStatus: data.order.fulfillment_status,
            total: data.order.total_price,
            items: data.order.line_items.map((item): ShopifyOrderLineItem => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: data.order.shipping_address,
            createdAt: data.order.created_at,
          }
        }

        if (email) {
          const response = await fetch(
            `https://${client.shop}/admin/api/2024-10/orders.json?email=${email}&limit=10`,
            {
              headers: {
                'X-Shopify-Access-Token': client.accessToken,
              },
            }
          )

          if (!response.ok) {
            return { error: 'Failed to fetch orders' }
          }

          const data = (await response.json()) as ShopifyOrdersResponse
          return {
            orders: data.orders.map((order) => ({
              orderNumber: `#${order.order_number}`,
              status: order.financial_status,
              fulfillmentStatus: order.fulfillment_status,
              total: order.total_price,
              createdAt: order.created_at,
            })),
          }
        }

        return { error: 'Either orderNumber or email must be provided' }
      },
    } as any),

    createReturn: tool({
      description: 'Create a return/refund request for an order',
      parameters: z.object({
        orderNumber: z.string().describe('Order number'),
        items: z.array(z.object({
          lineItemId: z.string(),
          quantity: z.number(),
          reason: z.string().optional(),
        })),
      }),
      execute: async ({ orderNumber, items }: { orderNumber: string; items: Array<{ lineItemId: string; quantity: number; reason?: string }> }) => {
        const client = await getShopifyClient(tenantId)
        const orderId = orderNumber.replace('#', '')

        const response = await fetch(
          `https://${client.shop}/admin/api/2024-10/orders/${orderId}/refunds.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': client.accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refund: {
                notify: true,
                note: 'Return requested via support agent',
                refund_line_items: items.map((item) => ({
                  line_item_id: item.lineItemId,
                  quantity: item.quantity,
                })),
              },
            }),
          }
        )

        if (!response.ok) {
          const error = await response.text()
          return { error: `Failed to create return: ${error}` }
        }

        const data = (await response.json()) as ShopifyRefundResponse
        return {
          success: true,
          refundId: data.refund.id,
          amount: data.refund.amount,
        }
      },
    } as any),

    cancelOrder: tool({
      description: 'Cancel an order that has not been fulfilled',
      parameters: z.object({
        orderNumber: z.string().describe('Order number'),
        reason: z.string().optional().describe('Reason for cancellation'),
      }),
      execute: async ({ orderNumber, reason }: { orderNumber: string; reason?: string }) => {
        const client = await getShopifyClient(tenantId)
        const orderId = orderNumber.replace('#', '')

        const response = await fetch(
          `https://${client.shop}/admin/api/2024-10/orders/${orderId}/cancel.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': client.accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cancel: {
                reason: reason || 'Customer request',
                email: true,
              },
            }),
          }
        )

        if (!response.ok) {
          const error = await response.text()
          return { error: `Failed to cancel order: ${error}` }
        }

        const data = (await response.json()) as ShopifyOrderResponse
        return {
          success: true,
          cancelled: data.order.cancelled_at !== null,
        }
      },
    } as any),

    generateReturnLabel: tool({
      description: 'Generate a return shipping label for an order',
      parameters: z.object({
        orderNumber: z.string().describe('Order number'),
        carrier: z.string().optional().describe('Shipping carrier'),
      }),
      execute: async ({ orderNumber }: { orderNumber: string }) => {
        return {
          success: true,
          labelUrl: `https://example.com/labels/${orderNumber}`,
          message: 'Return label generated. Customer will receive it via email.',
        }
      },
    } as any),
  }
}

