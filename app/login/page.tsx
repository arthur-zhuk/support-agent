'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, Code, UserPlus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'false'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/connections'
  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    setEmailSent(false)
    
    try {
      const result = await signIn('email', {
        email: email.toLowerCase().trim(),
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        // Handle specific error cases
        if (result.error === 'Configuration') {
          toast.error('Email service is not configured. Please contact support.')
        } else if (result.error === 'AccessDenied') {
          toast.error('Access denied. Please contact support.')
        } else if (result.error === 'Verification') {
          toast.error('Verification failed. Please try again.')
        } else {
          toast.error(`Failed to send email: ${result.error}. Please try again.`)
        }
        setLoading(false)
      } else {
        setEmailSent(true)
        toast.success('Magic link sent! Check your email.')
        // Redirect to verify email page after a short delay
        setTimeout(() => {
          router.push('/verify-email')
        }, 1500)
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      const errorMessage = error?.message || 'An unexpected error occurred'
      toast.error(`Failed to sign in: ${errorMessage}. Please try again.`)
      setLoading(false)
    }
  }

  // Show success state if email was sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Email sent successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to sign in. If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in or Sign up</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link. New accounts are created automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Sign in failed</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    {error === 'Configuration' && 'Email service is not configured. Please contact support.'}
                    {error === 'AccessDenied' && 'Access denied. Please contact support.'}
                    {error === 'Verification' && 'Verification failed. Please try again.'}
                    {!['Configuration', 'AccessDenied', 'Verification'].includes(error) && 'Please try again or contact support if the problem persists.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || emailSent}
                required
                autoFocus
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                <UserPlus className="h-3 w-3 inline mr-1" />
                Don't have an account? Just enter your email and we'll create one for you.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading || emailSent}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send magic link
                </>
              )}
            </Button>
          </form>

          {isDevMode && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dev-login">
                  <Code className="h-4 w-4 mr-2" />
                  Dev Login (Bypass Auth)
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Quick login for development
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
