import { stripe } from '@/lib/stripe/client'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json()

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    let dbSubscription = await prisma.subscription.findUnique({
      where: { tenantId },
    })

    let stripeSubscription
    let stripeCustomerId: string

    if (dbSubscription?.stripeSubscriptionId) {
      stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripeSubscriptionId)
      stripeCustomerId = dbSubscription.stripeCustomerId
    } else {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { users: true },
      })

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }

      const customerEmail = tenant.users[0]?.email || 'demo@example.com'
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 })
      
      if (customers.data.length === 0) {
        return NextResponse.json({ error: 'No Stripe customer found. Please complete checkout first.' }, { status: 404 })
      }

      const customer = customers.data[0]
      stripeCustomerId = customer.id

      const subscriptions = await stripe.subscriptions.list({ customer: customer.id, limit: 1, status: 'all' })
      
      if (subscriptions.data.length === 0) {
        return NextResponse.json({ error: 'No active subscription found in Stripe' }, { status: 404 })
      }

      stripeSubscription = subscriptions.data[0]
    }

    const subscriptionObj = stripeSubscription as any
    const currentPeriodEnd = subscriptionObj.current_period_end
      ? new Date(subscriptionObj.current_period_end * 1000)
      : null

    const subscriptionData = {
      tenantId,
      stripeCustomerId: stripeCustomerId!,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || null,
      status: stripeSubscription.status,
      plan: stripeSubscription.items.data[0]?.price.nickname || 'Starter',
      currentPeriodEnd,
      cancelAtPeriodEnd: ('cancel_at_period_end' in stripeSubscription && typeof stripeSubscription.cancel_at_period_end === 'boolean')
        ? stripeSubscription.cancel_at_period_end
        : false,
    }

    const updated = await prisma.subscription.upsert({
      where: { tenantId },
      create: subscriptionData,
      update: subscriptionData,
    })

    return NextResponse.json({ subscription: updated })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

