import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

export const stripe = {
  get customers() {
    return getStripe().customers
  },
  get checkout() {
    return getStripe().checkout
  },
  get billingPortal() {
    return getStripe().billingPortal
  },
  get subscriptions() {
    return getStripe().subscriptions
  },
  webhooks: {
    constructEvent: (payload: string | Buffer, sig: string, secret: string) => {
      return getStripe().webhooks.constructEvent(payload, sig, secret)
    },
  },
} as Stripe

