import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, BookOpen, BarChart3, Settings, CreditCard } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard/knowledge" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-lg font-bold">AI Knowledge Base</span>
              </Link>
              <nav className="hidden md:flex gap-1">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/knowledge">Knowledge Base</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/analytics">Analytics</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.email}
                  {user.email === 'dev@localhost' && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      DEV
                    </span>
                  )}
                </span>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

