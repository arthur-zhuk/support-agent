import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, BookOpen, BarChart3, Settings } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard/connections" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-lg font-bold">Support Agent</span>
              </Link>
              <nav className="hidden md:flex gap-1">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/connections">Connections</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/knowledge">Knowledge Base</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/analytics">Analytics</Link>
                </Button>
              </nav>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

