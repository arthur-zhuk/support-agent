import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('[Test Auth] Attempting to sign in with email:', email)
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const signInUrl = `${baseUrl}/api/auth/signin/email`
    
    const formData = new URLSearchParams()
    formData.append('email', email.toLowerCase())
    formData.append('callbackUrl', '/dashboard/connections')
    formData.append('csrfToken', 'test') // CSRF token might be needed
    
    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const responseText = await response.text()
    console.log('[Test Auth] NextAuth response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500),
    })

    if (response.redirected) {
      return NextResponse.json({
        success: true,
        redirected: true,
        redirectUrl: response.url,
        status: response.status,
      })
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        status: response.status,
        message: 'Email should be sent',
      })
    }

    return NextResponse.json({
      success: false,
      error: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      body: responseText.substring(0, 200),
    }, { status: response.status })
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

