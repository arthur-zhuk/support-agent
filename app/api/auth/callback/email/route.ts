import { NextRequest } from 'next/server'
import { handlers } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  console.log('[Email Callback Route] Handling callback:', {
    url: request.url,
    pathname: request.nextUrl.pathname,
  })
  
  try {
    const response = await handlers.GET(request)
    console.log('[Email Callback Route] Response:', {
      status: response.status,
      redirected: response.redirected,
      url: response.url,
    })
    return response
  } catch (error: any) {
    console.error('[Email Callback Route] Error:', error)
    const url = new URL('/login?error=Verification', request.url)
    return Response.redirect(url)
  }
}

