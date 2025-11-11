import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'
import { NextRequest } from 'next/server'

// Log config initialization
console.log('[NextAuth Route] Initializing NextAuth with config:', {
  hasProviders: !!authConfig.providers && authConfig.providers.length > 0,
  providerCount: authConfig.providers?.length || 0,
  providerIds: authConfig.providers?.map(p => p.id) || [],
  nodeEnv: process.env.NODE_ENV,
})

const nextAuth = NextAuth(authConfig)
const { handlers, auth, signIn, signOut } = nextAuth

console.log('[NextAuth Route] NextAuth initialized successfully')

export { auth, signIn, signOut, handlers }
export const { GET, POST } = handlers

