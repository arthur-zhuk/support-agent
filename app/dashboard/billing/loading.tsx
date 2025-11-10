import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function BillingLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="h-9 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-80 bg-muted animate-pulse rounded" />
      </div>
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
      <div className="mb-8">
        <div className="h-7 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded mb-4" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 w-full bg-muted animate-pulse rounded" />
                  ))}
                </div>
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

