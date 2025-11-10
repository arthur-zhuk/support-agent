import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { env } from '@/lib/env'

const SHOPIFY_API_KEY = env.shopify.apiKey!
const SHOPIFY_API_SECRET = env.shopify.apiSecret!

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const tenantId = state || searchParams.get('tenantId')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Shopify OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${env.shopify.appUrl}/dashboard/connections?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (!shop || !code || !tenantId) {
    const missing = []
    if (!shop) missing.push('shop')
    if (!code) missing.push('code')
    if (!tenantId) missing.push('tenantId')
    console.error('Missing Shopify OAuth parameters:', missing.join(', '))
    return NextResponse.json(
      { error: 'Missing parameters', missing },
      { status: 400 }
    )
  }

  const hmac = searchParams.get('hmac')
  const params = new URLSearchParams(searchParams)
  params.delete('hmac')
  params.delete('signature')

  const message = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex')

  if (hash !== hmac) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 400 })
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 })
  }

  const { access_token, scope } = await response.json()
  console.log(`[Shopify OAuth] Received scopes: ${scope}`)
  const scopesArray = scope.split(',').map((s: string) => s.trim())
  console.log(`[Shopify OAuth] Scopes array:`, scopesArray)

  await prisma.connection.upsert({
    where: {
      tenantId_type: {
        tenantId,
        type: 'shopify',
      },
    },
    create: {
      tenantId,
      type: 'shopify',
      token: access_token,
      scopes: scopesArray,
      metadata: { shop },
    },
    update: {
      token: access_token,
      scopes: scopesArray,
      metadata: { shop },
    },
  })

  return NextResponse.redirect(`${env.shopify.appUrl}/dashboard/connections?connected=shopify`)
}

