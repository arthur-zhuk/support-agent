import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Store, MessageSquare } from 'lucide-react'
import Link from 'next/link'

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

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: { connected?: string }
}) {
  const tenantId = 'demo-tenant'

  const connections = await getConnections(tenantId)
  const shopifyConnected = connections.some(c => c.type === 'shopify')
  const intercomConnected = connections.some(c => c.type === 'intercom')
  const justConnected = searchParams?.connected

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
            {shopifyConnected ? (
              <Button variant="outline" disabled>
                Already Connected
              </Button>
            ) : (
              <Button asChild>
                <Link
                  href={`https://admin.shopify.com/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_orders,write_orders&redirect_uri=${encodeURIComponent((process.env.SHOPIFY_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api/oauth/shopify')}&state=${tenantId}`}
                >
                  Connect Shopify
                </Link>
              </Button>
            )}
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
                  href={`https://app.intercom.com/oauth?client_id=${process.env.INTERCOM_CLIENT_ID || ''}&redirect_uri=${encodeURIComponent((process.env.INTERCOM_REDIRECT_URI || process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api/oauth/intercom')}&state=${tenantId}`}
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

