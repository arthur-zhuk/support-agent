import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, callbackUrl } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/api/magic-link/verify?token=${token}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl || '/dashboard/connections')}`

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@support-agent.com',
      to: email,
      subject: 'Sign in to Support Agent',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Sign in to Support Agent</h1>
              <p>Click the link below to sign in to your account:</p>
              <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Sign in
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Sign in to Support Agent\n\nClick the link below to sign in:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`,
    })

    if (result.error) {
      console.error('[Magic Link] Resend error:', result.error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('[Magic Link] Email sent:', { emailId: result.data?.id, to: email })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Magic Link] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

