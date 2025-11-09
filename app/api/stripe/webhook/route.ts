import { stripe } from '@/lib/stripe/client'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const tenantId = session.metadata?.tenantId

        if (tenantId && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const currentPeriodEnd = 'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
            ? new Date(subscription.current_period_end * 1000)
            : null

          await prisma.subscription.upsert({
            where: { tenantId },
            create: {
              tenantId,
              stripeCustomerId: typeof session.customer === 'string' 
                ? session.customer 
                : session.customer?.id || '',
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id || null,
              status: subscription.status,
              plan: subscription.items.data[0]?.price.nickname || 'default',
              currentPeriodEnd,
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id || null,
              status: subscription.status,
              plan: subscription.items.data[0]?.price.nickname || 'default',
              currentPeriodEnd,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id || ''

        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (dbSubscription) {
          const currentPeriodEnd = 'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
            ? new Date(subscription.current_period_end * 1000)
            : null

          const cancelAtPeriodEnd = 'cancel_at_period_end' in subscription && typeof subscription.cancel_at_period_end === 'boolean'
            ? subscription.cancel_at_period_end
            : false

          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: subscription.status,
              currentPeriodEnd,
              cancelAtPeriodEnd,
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

