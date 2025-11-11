import { NextRequest } from 'next/server'
import { handlers } from '@/app/api/auth/[...nextauth]/route'

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
      redirected: response.redirected,
      url: response.url,
    })
    return response
  } catch (error: any) {
    console.error('[Email Callback] Error:', error)
    return Response.redirect(
      new URL('/login?error=VerificationFailed', request.nextUrl.origin)
    )
  }
}

