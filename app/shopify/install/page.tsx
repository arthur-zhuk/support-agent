import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, BookOpen, Code, MessageSquare, Sparkles } from 'lucide-react'
import { env } from '@/lib/env'

export const metadata = {
  title: 'Install AI Knowledge Base Widget - Shopify',
  description: 'Welcome! Get started with your AI-powered support widget in minutes.',
}

export default function ShopifyInstallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to AI Knowledge Base Widget</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically convert your documentation into an AI-powered support widget. 
            No manual FAQ entry needed—just add URLs and your AI assistant learns instantly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">1. Add Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add your help docs, FAQs, or documentation via URLs, sitemaps, or files.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">2. Copy Embed Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get your one-line embed script from the dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">3. Add to Shopify</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Paste the script into your Shopify theme and start answering questions instantly.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to get your AI support widget running
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Sign Up or Log In</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your account to get started. If you already have an account, log in to continue.
                </p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Add Your Knowledge Base</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Once logged in, go to the Knowledge Base page and add your content:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Add URLs (e.g., <code className="bg-muted px-1 rounded">https://yourstore.com/help</code>)</li>
                  <li>Add sitemaps for bulk ingestion</li>
                  <li>Upload files (PDF, Markdown, etc.)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  The system will automatically crawl, chunk, and index your content.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Copy Your Embed Code</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  From the Knowledge Base page, copy your embed script. It looks like this:
                </p>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs mb-2">
                  {`<script src="${env.baseUrl}/api/embed?tenantId=YOUR_TENANT_ID"></script>`}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Add to Your Shopify Theme</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You can add the widget to your Shopify store in two ways:
                </p>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Method 1: Theme Editor (Recommended)</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                      <li>Go to <strong>Online Store</strong> → <strong>Themes</strong> → <strong>Customize</strong></li>
                      <li>Click <strong>Theme settings</strong> → <strong>Additional scripts</strong></li>
                      <li>Paste your embed script in the <strong>Footer</strong> section</li>
                      <li>Click <strong>Save</strong></li>
                    </ol>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Method 2: Code Editor</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                      <li>Go to <strong>Online Store</strong> → <strong>Themes</strong> → <strong>Actions</strong> → <strong>Edit code</strong></li>
                      <li>Open <code className="bg-background px-1 rounded">theme.liquid</code></li>
                      <li>Find the <code className="bg-background px-1 rounded">&lt;/body&gt;</code> tag</li>
                      <li>Paste your embed script just before <code className="bg-background px-1 rounded">&lt;/body&gt;</code></li>
                      <li>Click <strong>Save</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Test Your Widget</h3>
                <p className="text-sm text-muted-foreground">
                  Visit your storefront and look for the chat widget in the bottom-right corner. 
                  Try asking a question to test that it&apos;s working correctly!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>What makes our AI Knowledge Base Widget special</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Auto-Ingest Content</h4>
                  <p className="text-sm text-muted-foreground">
                    No manual FAQ entry needed. Just add URLs, sitemaps, or files.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">RAG-Based Accuracy</h4>
                  <p className="text-sm text-muted-foreground">
                    Uses vector embeddings for precise, context-aware answers.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Source Citations</h4>
                  <p className="text-sm text-muted-foreground">
                    AI responses include source URLs for transparency.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Analytics Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Track conversations, deflection rates, and costs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Pricing & Registration</CardTitle>
            <CardDescription>
              View our pricing plans and sign up for the service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our service uses Stripe for secure payment processing outside of Shopify's billing system. 
              Choose a plan that fits your needs and get started in minutes.
            </p>
            <Button asChild>
              <Link href="/pricing">
                View Pricing & Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/login">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Need help? <a href="mailto:contact@velocityspanlabs.com" className="text-primary hover:underline">contact@velocityspanlabs.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

