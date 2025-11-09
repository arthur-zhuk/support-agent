import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL!

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const tenantId = state || searchParams.get('tenantId')

  if (!shop || !code || !tenantId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
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
      scopes: scope.split(','),
      metadata: { shop },
    },
    update: {
      token: access_token,
      scopes: scope.split(','),
      metadata: { shop },
    },
  })

  return NextResponse.redirect(`${SHOPIFY_APP_URL}/dashboard/connections?connected=shopify`)
}

