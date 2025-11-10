import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { BillingClient } from './billing-client'
import type { Subscription } from '@prisma/client'
import { getTenantId } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'

async function getSubscription(tenantId: string): Promise<Subscription | null> {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    })
    return subscription
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small stores',
    features: [
      'Up to 1,000 conversations/month',
      'Auto-ingest URLs, sitemaps & files',
      'RAG-based accurate answers',
      'Source citations',
      'Embeddable widget',
      'Email support',
    ],
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_1SRdhDISn03FmR1gcU7S41DB',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Up to 10,000 conversations/month',
      'Unlimited knowledge bases',
      'Auto-ingest URLs, sitemaps & files',
      'RAG-based accurate answers',
      'Source citations',
      'Custom branding',
      'Priority support',
      'Advanced analytics',
    ],
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1SRdhDISn03FmR1gZyFF8ugy',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited conversations',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom branding',
    ],
    priceId: null,
  },
]

export default async function BillingPage(props: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const tenantId = await getTenantId()
  if (!tenantId) {
    redirect('/login?callbackUrl=/dashboard/billing')
  }
  const searchParams = await props.searchParams
  const subscription = await getSubscription(tenantId)

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null

    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const, icon: CheckCircle2 },
      trialing: { label: 'Trial', variant: 'default' as const, icon: Clock },
      past_due: { label: 'Past Due', variant: 'destructive' as const, icon: XCircle },
      canceled: { label: 'Canceled', variant: 'outline' as const, icon: XCircle },
      incomplete: { label: 'Incomplete', variant: 'outline' as const, icon: Clock },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
      icon: Clock,
    }

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing
        </p>
        {searchParams?.success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              ✅ Payment successful! Your subscription is now active.
            </p>
          </div>
        )}
        {searchParams?.canceled && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Payment canceled. You can try again anytime.
            </p>
          </div>
        )}
      </div>

      {subscription && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  {subscription.plan || 'No plan selected'}
                </CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm text-muted-foreground">Current period ends</p>
                  <p className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <BillingClient tenantId={tenantId} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose a Plan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-2 w-fit">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
                  <BillingClient tenantId={tenantId} priceId={plan.priceId} planName={plan.name} />
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Contact Sales
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

