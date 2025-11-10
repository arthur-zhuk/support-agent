import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Pricing - AI Knowledge Base Widget',
  description: 'Choose the perfect plan for your store. Start with a free trial, no credit card required.',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small stores getting started',
    features: [
      'Up to 1,000 conversations/month',
      'Auto-ingest URLs, sitemaps & files',
      'RAG-based accurate answers',
      'Source citations',
      'One-line embed script',
      'Analytics dashboard',
      'Email support',
    ],
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
      'White-label options',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your store. All plans include our AI-powered support widget 
            with auto-ingest knowledge base. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.popular ? 'border-primary border-2 relative' : ''}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.id === 'enterprise' ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="mailto:contact@velocityspanlabs.com?subject=Enterprise Plan Inquiry">
                      Contact Sales
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Get started in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  Create your account and choose a plan. No credit card required to start.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Add Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">
                  Add your help docs via URLs, sitemaps, or files. Our AI learns instantly.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Embed Widget</h3>
                <p className="text-sm text-muted-foreground">
                  Copy the embed script and add it to your Shopify theme. Done!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="grid gap-6 md:grid-cols-2 text-left max-w-4xl mx-auto">
                <div>
                  <h3 className="font-semibold mb-2">How does billing work?</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Stripe for secure payment processing. You'll be charged monthly based on your selected plan. 
                    You can upgrade, downgrade, or cancel anytime from your dashboard.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate the billing accordingly.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What happens if I exceed my plan limits?</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when you're approaching your limit. You can upgrade to a higher plan 
                    or we can discuss custom pricing for your needs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can sign up and test the service before subscribing. No credit card required 
                    to create an account and explore the features.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Questions about pricing? <a href="mailto:contact@velocityspanlabs.com" className="text-primary hover:underline">Contact us</a>
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

