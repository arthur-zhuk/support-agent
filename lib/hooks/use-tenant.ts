'use client'

import { useState, useEffect } from 'react'

export function useTenantId() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tenant/me')
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('Failed to get tenant ID')
      })
      .then((data) => {
        setTenantId(data.tenantId)
        setLoading(false)
      })
      .catch(() => {
        setTenantId(process.env.NODE_ENV === 'development' ? 'dev-tenant' : null)
        setLoading(false)
      })
  }, [])

  return { tenantId, loading }
}

