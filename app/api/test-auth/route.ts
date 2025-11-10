import { NextResponse } from 'next/server'
import { signIn } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('[Test Auth] Attempting to sign in with email:', email)
    
    const result = await signIn('email', {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl: '/dashboard/connections',
    })

    console.log('[Test Auth] signIn result:', {
      ok: result?.ok,
      error: result?.error,
      url: result?.url,
      status: result?.status,
    })

    return NextResponse.json({
      success: result?.ok || false,
      error: result?.error || null,
      url: result?.url || null,
      status: result?.status || null,
    })
  } catch (error: any) {
    console.error('[Test Auth] Error:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

