import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import type { NextAuthConfig } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'

export const authConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM || 'noreply@support-agent.com',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { tenant: true },
      })

      if (!existingUser) {
        const tenantSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
        const tenant = await prisma.tenant.create({
          data: {
            name: user.name || user.email.split('@')[0],
            slug: tenantSlug,
            users: {
              create: {
                email: user.email,
                name: user.name,
                emailVerified: new Date(),
              },
            },
          },
        })
        return true
      }

      return true
    },
    async session({ session, user, token }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { tenant: true },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.tenantId = dbUser.tenantId
          session.user.tenant = {
            id: dbUser.tenant.id,
            name: dbUser.tenant.name,
            slug: dbUser.tenant.slug,
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
