import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { SignJWT } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/connections'

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
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.nextUrl.origin))
    }

    if (verificationToken.expires < new Date()) {
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

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'development-secret')
    const jwtToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    const response = NextResponse.redirect(new URL(callbackUrl, request.nextUrl.origin))
    
    response.cookies.set('next-auth.session-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('[Magic Link Verify] Error:', error)
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.nextUrl.origin))
  }
}

