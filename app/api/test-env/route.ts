import { NextResponse } from 'next/server'

export async function GET() {
  const hasResendApiKey = !!process.env.RESEND_API_KEY
  const resendFrom = process.env.RESEND_FROM
  const apiKeyLength = process.env.RESEND_API_KEY?.length || 0
  
  return NextResponse.json({
    hasResendApiKey,
    resendFrom,
    apiKeyLength,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('RESEND') || key.includes('SMTP')),
  })
}

