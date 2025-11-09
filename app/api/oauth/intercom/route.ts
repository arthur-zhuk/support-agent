import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

const INTERCOM_CLIENT_ID = process.env.INTERCOM_CLIENT_ID!
const INTERCOM_CLIENT_SECRET = process.env.INTERCOM_CLIENT_SECRET!
const INTERCOM_REDIRECT_URI = process.env.INTERCOM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/intercom`

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const tenantId = state || searchParams.get('tenantId') || 'demo-tenant'

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const response = await fetch('https://api.intercom.io/auth/eagle/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: INTERCOM_CLIENT_ID,
      client_secret: INTERCOM_CLIENT_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 })
  }

  const { access_token, expires_in } = await response.json()

  const expiresAt = expires_in
    ? new Date(Date.now() + expires_in * 1000)
    : null

  await prisma.connection.upsert({
    where: {
      tenantId_type: {
        tenantId,
        type: 'intercom',
      },
    },
    create: {
      tenantId,
      type: 'intercom',
      token: access_token,
      expiresAt,
      scopes: ['read', 'write'],
    },
    update: {
      token: access_token,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  return NextResponse.redirect(`${baseUrl}/dashboard/connections?connected=intercom`)
}

