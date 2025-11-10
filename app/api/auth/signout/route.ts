import { signOut } from 'next-auth/react'
import { NextResponse } from 'next/server'

export async function POST() {
  await signOut({ callbackUrl: '/login' })
  return NextResponse.json({ success: true })
}

