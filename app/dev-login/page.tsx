'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function DevLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setStatus('error')
    }
  }, [])

  const handleDevLogin = async () => {
    if (process.env.NODE_ENV !== 'development') {
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/dev/login', {
        method: 'POST',
      })

      if (response.ok) {
        setStatus('success')
        setTimeout(() => {
          router.push('/dashboard/connections')
        }, 1000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">Not Available</CardTitle>
            <CardDescription>
              Dev login is only available in development mode.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Dev Login</CardTitle>
          <CardDescription>
            Quick login for development. Bypasses email authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">Development Only</p>
                <p className="text-sm text-yellow-700">
                  This login method is only available in development mode. It will automatically
                  create a dev tenant and user if they don't exist.
                </p>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Logged in! Redirecting...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  Failed to login. Make sure you're in development mode.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleDevLogin}
            disabled={status === 'loading' || status === 'success'}
            className="w-full"
          >
            {status === 'loading' ? 'Logging in...' : 'Login as Dev User'}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Email: dev@localhost | Tenant: dev-tenant
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

