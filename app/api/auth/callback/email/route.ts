import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const nextAuth = NextAuth(authConfig)
const { handlers } = nextAuth

export async function GET(request: NextRequest) {
  console.log('[Email Callback] Handling callback:', {
    url: request.url,
    pathname: request.nextUrl.pathname,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
  })
  
  try {
    const response = await handlers.GET(request)
    console.log('[Email Callback] Response:', {
      status: response.status,
      type: response.type,
    })
    return response
  } catch (error: any) {
    console.error('[Email Callback] Error:', error)
    return NextResponse.redirect(
      new URL('/login?error=Verification', request.nextUrl.origin)
    )
  }
}

