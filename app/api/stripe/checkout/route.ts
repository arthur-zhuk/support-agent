import { stripe } from '@/lib/stripe/client'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tenantId, priceId } = await req.json()

    if (!tenantId || !priceId) {
      return NextResponse.json({ error: 'Missing tenantId or priceId' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true, users: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    let customerId: string

    if (tenant.subscription?.stripeCustomerId) {
      customerId = tenant.subscription.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: tenant.users[0]?.email || undefined,
        metadata: {
          tenantId,
        },
      })
      customerId = customer.id

      await prisma.subscription.upsert({
        where: { tenantId },
        create: {
          tenantId,
          stripeCustomerId: customerId,
          status: 'incomplete',
        },
        update: {
          stripeCustomerId: customerId,
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
      metadata: {
        tenantId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

