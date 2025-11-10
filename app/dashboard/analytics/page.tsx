import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, CheckCircle2, ArrowUpRight, TrendingUp } from 'lucide-react'
import type { MetricsDaily } from '@prisma/client'
import { getTenantId } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'

async function getMetrics(tenantId: string): Promise<MetricsDaily[]> {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const metrics = await prisma.metricsDaily.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      take: 30,
    })
    return metrics
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export default async function AnalyticsPage() {
  const tenantId = await getTenantId()
  if (!tenantId) {
    redirect('/login?callbackUrl=/dashboard/analytics')
  }

  const metrics = await getMetrics(tenantId)

  const totalConversations = metrics.reduce((sum, m) => sum + (m.conversations || 0), 0)
  const totalDeflections = metrics.reduce((sum, m) => sum + (m.deflections || 0), 0)
  const totalEscalations = metrics.reduce((sum, m) => sum + (m.escalations || 0), 0)
  const deflectionRate = totalConversations > 0 
    ? ((totalDeflections / totalConversations) * 100).toFixed(1) 
    : '0'

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your support agent performance and impact
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deflections</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeflections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {deflectionRate}% deflection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escalations</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEscalations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              To human agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost Estimate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.reduce((sum, m) => sum + (m.costEstimate || 0), 0).toFixed(2)}
              </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated AI costs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Daily metrics for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data yet</p>
          ) : (
              <div className="space-y-4">
                {metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">
                      {new Date(metric.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Conversations: </span>
                      <span className="font-medium">{metric.conversations}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deflections: </span>
                      <span className="font-medium">{metric.deflections}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Escalations: </span>
                      <span className="font-medium">{metric.escalations}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

