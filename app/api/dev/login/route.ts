import { NextResponse } from 'next/server'
import { ensureDevTenant, isDevMode } from '@/lib/auth/dev-bypass'
import { SignJWT } from 'jose'

const DEV_TENANT_ID = 'dev-tenant'
const DEV_USER_EMAIL = 'dev@localhost'

export async function POST() {
  if (!isDevMode()) {
    return NextResponse.json(
      { error: 'Dev login is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const tenant = await ensureDevTenant()
    
    if (!tenant || !tenant.users || tenant.users.length === 0) {
      return NextResponse.json(
        { error: 'Dev user not found' },
        { status: 500 }
      )
    }

    const user = tenant.users[0]

    let secret: string = process.env.NEXTAUTH_SECRET || ''
    if (!secret || secret.length < 32) {
      secret = 'dev-secret-change-in-production-min-32-chars-long-please-set-this'
    }

    const secretKey = new TextEncoder().encode(secret)
    
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name || 'Dev User',
      tenantId: user.tenantId,
      userId: user.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secretKey)

    const response = NextResponse.json({ success: true, message: 'Dev login successful' })
    
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Dev login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { 
        error: 'Failed to setup dev tenant', 
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}
