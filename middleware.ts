import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const isDevMode = () => {
  return process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS !== 'false'
}

export async function middleware(request: NextRequest) {
  if (isDevMode()) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    salt: 'authjs.session-token',
  })

  console.log('[Middleware] Token check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    cookies: request.cookies.getAll().map(c => c.name),
  })

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/dashboard/connections', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

