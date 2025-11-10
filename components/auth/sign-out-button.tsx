'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'false'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = () => {
    if (isDevMode) {
      router.push('/dev-login')
    } else {
      signOut({ callbackUrl: '/login' })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
}

