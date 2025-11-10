import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/auth/tenant'

export async function GET() {
  try {
    const tenantId = await getTenantId()
    return NextResponse.json({ tenantId })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get tenant ID' },
      { status: 401 }
    )
  }
}

