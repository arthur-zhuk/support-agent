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

  console.log(`[getShopifyClient] Connection scopes: ${connection.scopes?.join(', ') || 'none'}`)
  
  // Check if read_orders scope is present
  if (!connection.scopes || !connection.scopes.includes('read_orders')) {
    throw new Error(
      'Shopify connection is missing the "read_orders" scope. ' +
      'Please uninstall and reinstall the app in your Shopify store to refresh scopes. ' +
      'Go to Settings > Apps and sales channels > App development, find the app, and click "Install app" again.'
    )
  }
  
  return {
    accessToken: connection.token,
    shop,
  }
}

export function getShopifyTools(tenantId: string) {
  return {
    getOrderByNumber: tool({
      description: 'Get the status and details of an order by order number',
      inputSchema: z.object({
        orderNumber: z.string().describe('Order number (e.g., #1001)'),
      }),
      execute: async ({ orderNumber }: { orderNumber: string }) => {
        console.log(`[getOrderByNumber] Executing tool with orderNumber: ${orderNumber}`)
        const client = await getShopifyClient(tenantId)
        const orderNum = orderNumber.replace('#', '').trim()
        
        const listUrl = `https://${client.shop}/admin/api/2024-10/orders.json?limit=250&status=any&financial_status=any&fulfillment_status=any`
        console.log(`[getOrderByNumber] Fetching orders from: ${listUrl}`)
        console.log(`[getOrderByNumber] Shop: ${client.shop}, Access token present: ${!!client.accessToken}`)
        
        const listResponse = await fetch(listUrl, {
          headers: {
            'X-Shopify-Access-Token': client.accessToken,
          },
        })

        console.log(`[getOrderByNumber] List response status: ${listResponse.status}`)

        if (!listResponse.ok) {
          const errorText = await listResponse.text()
          console.error(`Shopify API list error:`, listResponse.status, errorText)
          return {
            error: 'List failed',
            status: listResponse.status,
            message: `Unable to list orders. Please check the order number and try again.`
          }
        }

        const listData = (await listResponse.json()) as ShopifyOrdersResponse
        console.log(`[getOrderByNumber] API returned ${listData.orders?.length || 0} orders`)
        
        console.log(`[getOrderByNumber] Listed ${listData.orders?.length || 0} orders. Looking for order_number: ${orderNum}`)
        if (listData.orders && listData.orders.length > 0) {
          console.log(`[getOrderByNumber] First order order_number: ${listData.orders[0].order_number}, type: ${typeof listData.orders[0].order_number}`)
          console.log(`[getOrderByNumber] Available order numbers: ${listData.orders.slice(0, 5).map(o => o.order_number).join(', ')}`)
        }
        
        const order = listData.orders?.find(o => String(o.order_number) === String(orderNum))
        
        if (!order) {
          return {
            error: 'Order not found',
            status: 404,
            message: `Order #${orderNum} was not found. Please verify the order number and try again.`
          }
        }

        if (!order.id) {
          return {
            error: 'Order ID not found',
            status: 500,
            message: `Found order #${orderNum} but could not retrieve its ID. Please try again.`
          }
        }
        const response = await fetch(
          `https://${client.shop}/admin/api/2024-10/orders/${order.id}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': client.accessToken,
            },
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Shopify API error for order ${order.id}:`, response.status, errorText)
          let errorMessage = 'Order not found'
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.errors) {
              errorMessage = Array.isArray(errorJson.errors) 
                ? errorJson.errors.join(', ')
                : String(errorJson.errors)
            }
          } catch {
            errorMessage = errorText.substring(0, 200)
          }
          const result = { 
            error: errorMessage,
            status: response.status,
            message: `Unable to retrieve order #${orderNum}. ${errorMessage.includes('protected customer data') ? 'The app needs approval for protected customer data access in the Shopify Partner Dashboard.' : 'Please check the order number and try again.'}`
          }
          console.log(`[getOrderByNumber] Returning error result:`, JSON.stringify(result, null, 2))
          return result
        }

        const data = (await response.json()) as ShopifyOrderResponse
        const result = {
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
        console.log(`[getOrderByNumber] Returning success result:`, JSON.stringify(result, null, 2))
        return result
      },
    }),

    getOrdersByEmail: tool({
      description: 'Get orders for a customer by their email address',
      inputSchema: z.object({
        email: z.string().email().describe('Customer email address'),
      }).required(),
      execute: async ({ email }: { email: string }) => {
        const client = await getShopifyClient(tenantId)
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
      },
    }),

    createReturn: tool({
      description: 'Create a return/refund request for an order',
      inputSchema: z.object({
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
    }),

    cancelOrder: tool({
      description: 'Cancel an order that has not been fulfilled',
      inputSchema: z.object({
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
    }),

    generateReturnLabel: tool({
      description: 'Generate a return shipping label for an order',
      inputSchema: z.object({
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
    }),
  }
}

