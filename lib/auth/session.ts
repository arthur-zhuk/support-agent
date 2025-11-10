import { auth } from '@/app/api/auth/[...nextauth]/route'
import { isDevMode, getDevTenantId, getDevUserEmail, ensureDevTenant } from './dev-bypass'

export async function getSession() {
  const nextAuthSession = await auth()
  
  if (nextAuthSession?.user) {
    return nextAuthSession
  }
  
  if (isDevMode()) {
    await ensureDevTenant()
    return {
      user: {
        id: 'dev-user-id',
        email: getDevUserEmail(),
        name: 'Dev User',
        tenantId: getDevTenantId(),
        tenant: {
          id: getDevTenantId(),
          name: 'Development Tenant',
          slug: 'dev-tenant',
        },
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }
  
  return nextAuthSession
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function getCurrentTenantId() {
  if (isDevMode()) {
    return getDevTenantId()
  }
  const user = await getCurrentUser()
  return (user as any)?.tenantId || null
}

