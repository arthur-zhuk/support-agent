import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Store, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { getTenantId } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { env } from '@/lib/env'

async function getConnections(tenantId: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const connections = await prisma.connection.findMany({
      where: { tenantId },
    })
    return connections
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export default async function ConnectionsPage(props: {
  searchParams: Promise<{ connected?: string; error?: string; error_description?: string }>
}) {
  const tenantId = await getTenantId()
  if (!tenantId) {
    redirect('/login?callbackUrl=/dashboard/connections')
  }
  const searchParams = await props.searchParams

  const connections = await getConnections(tenantId)
  const shopifyConnected = connections.some((c: { type: string }) => c.type === 'shopify')
  const intercomConnected = connections.some((c: { type: string }) => c.type === 'intercom')
  const justConnected = searchParams?.connected
  const oauthError = searchParams?.error
  const oauthErrorDescription = searchParams?.error_description

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect your services to enable order-aware support features
        </p>
        {justConnected && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              ✅ Successfully connected {justConnected === 'intercom' ? 'Intercom' : 'Shopify'}!
            </p>
          </div>
        )}
        {oauthError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold">❌ Connection Failed</p>
            <p className="text-red-700 mt-1">{oauthErrorDescription || oauthError}</p>
            {oauthError === 'invalid_request' && oauthErrorDescription?.includes('redirect_uri') && (
              <div className="mt-3 text-sm text-red-600">
                <p className="font-semibold">To fix this:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to your Shopify Partner Dashboard</li>
                  <li>Navigate to your app settings</li>
                  <li>Set <strong>App URL</strong> to: <code className="bg-red-100 px-1 rounded">http://localhost:3000</code></li>
                  <li>Add to <strong>Allowed redirection URL(s)</strong>: <code className="bg-red-100 px-1 rounded">http://localhost:3000/api/oauth/shopify</code></li>
                  <li>Save and try again</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="h-6 w-6" />
                <CardTitle>Shopify</CardTitle>
              </div>
              {shopifyConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              Connect your Shopify store to enable order lookup, returns, and cancellations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link
                href={`https://admin.shopify.com/oauth/authorize?client_id=${env.shopify.apiKey}&scope=read_orders,write_orders&redirect_uri=${encodeURIComponent(`${env.shopify.appUrl}/api/oauth/shopify`)}&state=${tenantId}`}
              >
                {shopifyConnected ? 'Reconnect Shopify' : 'Connect Shopify'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <CardTitle>Intercom</CardTitle>
              </div>
              {intercomConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              Connect your Intercom workspace for seamless escalation and ticket management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intercomConnected ? (
              <Button variant="outline" disabled>
                Already Connected
              </Button>
            ) : (
              <Button asChild>
                <Link
                  href={`https://app.intercom.com/oauth?client_id=${env.intercom.clientId || ''}&redirect_uri=${encodeURIComponent(env.intercom.redirectUri)}&state=${tenantId}`}
                >
                  Connect Intercom
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

