import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import type { NextAuthConfig } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { ResendEmailProvider } from '@/lib/auth/resend-provider'

// Helper function to ensure tenant exists for a user
async function ensureTenantForUser(email: string, name?: string | null) {
  // First, check if user with this email already has a tenant
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  })
  
  if (existingUser?.tenant) {
    return existingUser.tenant
  }
  
  // Generate tenant slug from email
  const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  // Try to find existing tenant with base slug (might have been created in signIn callback)
  let existingTenant = await prisma.tenant.findUnique({ where: { slug: baseSlug } })
  
  if (existingTenant) {
    return existingTenant
  }
  
  // Find first available slug (base slug or with counter suffix)
  let counter = 0
  let uniqueSlug = baseSlug
  
  while (counter < 100) {
    existingTenant = await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })
    
    if (!existingTenant) {
      // This slug is available, use it
      break
    }
    
    // Slug taken, try next
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }
  
  // Create new tenant with the available slug
  return await prisma.tenant.create({
    data: {
      name: name || email.split('@')[0],
      slug: uniqueSlug,
    },
  })
}

// Use NextAuth's built-in Resend provider
const getEmailProvider = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const resendFrom = (process.env.RESEND_FROM || 'noreply@support-agent.com').trim()
  
  console.log('[Auth Config] getEmailProvider called:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    resendFrom,
    nodeEnv: process.env.NODE_ENV,
  })
  
  if (apiKey) {
    console.log('[Auth Config] Using custom Resend provider')
    // Use our custom Resend provider that we know works
    // It reads RESEND_API_KEY directly from env vars in sendVerificationRequest
    return ResendEmailProvider({
      from: resendFrom,
    })
  }
  
  // Fallback to standard EmailProvider if Resend is not configured
  console.warn('[Auth Config] RESEND_API_KEY not found, using EmailProvider (will fail without SMTP)')
  return EmailProvider({
    server: {
      host: 'localhost',
      port: 587,
      auth: {
        user: 'noreply',
        pass: 'password',
      },
    },
    from: resendFrom,
  })
}

export const authConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [getEmailProvider()],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error('Sign in failed: No email provided')
        return false
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { tenant: true },
        })

        // If user exists and has a tenant, allow sign in
        if (existingUser && existingUser.tenantId) {
          return true
        }

        // If user exists but has no tenant, create one and link them
        if (existingUser && !existingUser.tenantId) {
          const tenant = await ensureTenantForUser(user.email, user.name)
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { tenantId: tenant.id },
          })
          return true
        }

        // User doesn't exist - ensure tenant exists for when PrismaAdapter creates the user
        // The tenant will be linked in the session callback
        await ensureTenantForUser(user.email, user.name)
        return true
      } catch (error: any) {
        console.error('Sign in callback error:', error)
        // Don't block sign in - allow PrismaAdapter to handle user creation
        // Tenant can be created later if needed
        if (error.code === 'P2002') {
          // Unique constraint violation - tenant might already exist, that's fine
          return true
        }
        // For other errors, still allow sign in attempt
        return true
      }
    },
    async session({ session, user, token }) {
      if (session.user?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { tenant: true },
        })

        // If user exists but has no tenant, create one and link them
        if (dbUser && !dbUser.tenantId) {
          const tenant = await ensureTenantForUser(session.user.email, session.user.name)
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { tenantId: tenant.id },
            include: { tenant: true },
          })
        }

        if (dbUser && dbUser.tenant) {
          return {
            ...session,
            user: {
              ...session.user,
              id: dbUser.id,
              tenantId: dbUser.tenantId,
              tenant: {
                id: dbUser.tenant.id,
                name: dbUser.tenant.name,
                slug: dbUser.tenant.slug,
              },
            },
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: (user as any).email },
          include: { tenant: true },
        })
        if (dbUser) {
          token.tenantId = dbUser.tenantId
          token.userId = dbUser.id
        }
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/dashboard/connections`
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    verifyRequest: '/verify-email',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
