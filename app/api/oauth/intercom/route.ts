import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

const INTERCOM_CLIENT_ID = env.intercom.clientId!
const INTERCOM_CLIENT_SECRET = env.intercom.clientSecret!

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const tenantId = state || searchParams.get('tenantId')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  if (error) {
    console.error('Intercom OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${env.baseUrl}/dashboard/connections?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`
    )
  }
  
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
  }

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

  return NextResponse.redirect(`${env.baseUrl}/dashboard/connections?connected=intercom`)
}

