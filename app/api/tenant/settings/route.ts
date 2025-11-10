import { NextRequest, NextResponse } from 'next/server'
import { getTenantId } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const currentTenantId = await getTenantId()
    const { tenantId, name, slug } = await req.json()

    if (!tenantId || tenantId !== currentTenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    if (existingTenant && existingTenant.id !== tenantId) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 400 }
      )
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { name, slug },
    })

    return NextResponse.json({ tenant: updated })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

