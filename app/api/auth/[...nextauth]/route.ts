import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

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

async function handleRequest(request: Request) {
  const url = new URL(request.url)
  console.log('[NextAuth Route] Handling request:', {
    pathname: url.pathname,
    method: request.method,
    searchParams: Object.fromEntries(url.searchParams.entries()),
  })
  
  try {
    if (request.method === 'GET') {
      return handlers.GET(request)
    } else if (request.method === 'POST') {
      return handlers.POST(request)
    }
    return new Response('Method not allowed', { status: 405 })
  } catch (error: any) {
    console.error('[NextAuth Route] Error handling request:', error)
    throw error
  }
}

export { auth, signIn, signOut, handlers }
export async function GET(request: Request) {
  return handleRequest(request)
}
export async function POST(request: Request) {
  return handleRequest(request)
}

