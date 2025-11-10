import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/connections'

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=Verification', request.url))
  }

  try {
    const session = await auth()
    
    if (session?.user) {
      const redirectUrl = callbackUrl.startsWith('/') 
        ? new URL(callbackUrl, request.url)
        : new URL(callbackUrl)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.redirect(new URL('/login?error=Verification', request.url))
  } catch (error) {
    console.error('[Email Callback] Error:', error)
    return NextResponse.redirect(new URL('/login?error=Verification', request.url))
  }
}

