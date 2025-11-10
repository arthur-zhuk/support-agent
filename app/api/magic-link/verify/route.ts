import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { encode } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/connections'

    console.log('[Magic Link Verify] Starting verification:', { token: token?.substring(0, 10), email })

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.nextUrl.origin))
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token,
        },
      },
    })

    if (!verificationToken) {
      console.log('[Magic Link Verify] Token not found')
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.nextUrl.origin))
    }

    if (verificationToken.expires < new Date()) {
      console.log('[Magic Link Verify] Token expired')
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email.toLowerCase(),
            token,
          },
        },
      })
      return NextResponse.redirect(new URL('/login?error=TokenExpired', request.nextUrl.origin))
    }

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token,
        },
      },
    })

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true },
    })

    if (!user) {
      console.log('[Magic Link Verify] Creating new user')
      const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const tenant = await prisma.tenant.create({
        data: {
          name: `${email.split('@')[0]}'s Workspace`,
          slug,
        },
      })

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0],
          tenantId: tenant.id,
          emailVerified: new Date(),
        },
        include: { tenant: true },
      })
    } else if (!user.tenantId) {
      console.log('[Magic Link Verify] Linking user to tenant')
      const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const tenant = await prisma.tenant.create({
        data: {
          name: `${email.split('@')[0]}'s Workspace`,
          slug,
        },
      })

      user = await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id },
        include: { tenant: true },
      })
    }

    const sessionToken = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      salt: 'authjs.session-token',
      maxAge: 30 * 24 * 60 * 60,
    })

    const response = NextResponse.redirect(new URL(callbackUrl, request.nextUrl.origin))
    
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    console.log('[Magic Link Verify] Session created successfully:', {
      cookieName,
      userId: user.id,
      email: user.email,
      redirectTo: callbackUrl,
    })

    return response
  } catch (error: any) {
    console.error('[Magic Link Verify] Error:', error)
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.nextUrl.origin))
  }
}

