import { getCurrentTenantId } from './session'
import { getDevTenantId, isDevMode } from './dev-bypass'

export async function getTenantId(): Promise<string> {
  if (isDevMode()) {
    const devTenantId = getDevTenantId()
    if (devTenantId) {
      return devTenantId
    }
    return 'dev-tenant'
  }
  
  const tenantId = await getCurrentTenantId()
  if (!tenantId) {
    throw new Error('No tenant ID found. Please log in.')
  }
  return tenantId
}

