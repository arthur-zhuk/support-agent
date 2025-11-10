import { prisma } from '@/lib/db/prisma'
import { randomUUID } from 'crypto'

const DEV_TENANT_ID = 'dev-tenant'
const DEV_USER_EMAIL = 'dev@localhost'

export async function ensureDevTenant() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, DEV_TENANT_ID, 'Development Tenant', 'dev-tenant')
    
    const userId = randomUUID()
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "User" (id, email, name, "tenantId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `, userId, DEV_USER_EMAIL, 'Dev User', DEV_TENANT_ID)
    } catch (userError: any) {
      if (userError?.message?.includes('emailVerified') || userError?.code === '42703') {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "User" (id, email, name, "tenantId", "emailVerified", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
          ON CONFLICT (email) DO NOTHING
        `, userId, DEV_USER_EMAIL, 'Dev User', DEV_TENANT_ID)
      } else {
        throw userError
      }
    }

    const userResult = await prisma.$queryRawUnsafe<Array<{id: string, email: string, name: string | null, tenantId: string}>>(`
      SELECT id, email, name, "tenantId" FROM "User" WHERE email = $1
    `, DEV_USER_EMAIL)

    if (userResult.length === 0) {
      throw new Error('Failed to create user')
    }

    const user = userResult[0]

    return {
      id: DEV_TENANT_ID,
      name: 'Development Tenant',
      slug: 'dev-tenant',
      users: [{
        id: user.id,
        email: user.email,
        name: user.name || 'Dev User',
        tenantId: user.tenantId,
      }],
    } as any
  } catch (error: any) {
    console.error('Error creating dev tenant:', error)
    throw error
  }
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS !== 'false'
}

export function getDevTenantId(): string | null {
  return isDevMode() ? DEV_TENANT_ID : null
}

export function getDevUserEmail(): string | null {
  return isDevMode() ? DEV_USER_EMAIL : null
}
