import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const { handlers } = NextAuth(authConfig)

export const { auth, signIn, signOut } = NextAuth(authConfig)

export const { GET, POST } = handlers

