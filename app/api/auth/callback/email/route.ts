import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const nextAuth = NextAuth(authConfig)
const { handlers } = nextAuth

export async function GET(request: NextRequest) {
  console.log('[Email Callback Route] Handling callback:', {
    url: request.url,
    pathname: request.nextUrl.pathname,
  })
  
  try {
    return handlers.GET(request)
  } catch (error: any) {
    console.error('[Email Callback Route] Error:', error)
    return NextResponse.redirect(new URL('/login?error=Verification', request.url))
  }
}

