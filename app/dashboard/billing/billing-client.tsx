'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function BillingClient({
  tenantId,
  priceId,
  planName,
}: {
  tenantId: string
  priceId?: string
  planName?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!priceId) return

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast.error('Failed to open billing portal. Please try again.')
      setLoading(false)
    }
  }

  if (priceId) {
    return (
      <Button onClick={handleCheckout} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Subscribe to {planName}
          </>
        )}
      </Button>
    )
  }

  return (
    <Button onClick={handlePortal} disabled={loading} variant="outline" className="w-full">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Billing
        </>
      )}
    </Button>
  )
}

