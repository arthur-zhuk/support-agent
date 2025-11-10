#!/usr/bin/env tsx
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })

const apiKey = process.env.RESEND_API_KEY?.trim()
const from = process.env.RESEND_FROM?.trim()

console.log('Testing Resend configuration locally...\n')
console.log('Environment variables:')
console.log(`  RESEND_API_KEY: ${apiKey ? `${apiKey.substring(0, 10)}... (length: ${apiKey.length})` : 'NOT SET'}`)
console.log(`  RESEND_FROM: ${from || 'NOT SET'}\n`)

if (!apiKey) {
  console.error('❌ RESEND_API_KEY is not set!')
  console.log('\nTo set it locally, create a .env.local file with:')
  console.log('RESEND_API_KEY=your_api_key_here')
  console.log('RESEND_FROM=contact@velocityspanlabs.com')
  process.exit(1)
}

if (!from) {
  console.error('❌ RESEND_FROM is not set!')
  console.log('\nTo set it locally, create a .env.local file with:')
  console.log('RESEND_FROM=contact@velocityspanlabs.com')
  process.exit(1)
}

const resend = new Resend(apiKey)

async function testResend() {
  console.log('Sending test email...\n')
  
  try {
    const result = await resend.emails.send({
      from: from!,
      to: 'arthurzhuk@gmail.com', // Change this to your test email
      subject: 'Test email from local development',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Test Email</h1>
              <p>This is a test email sent from your local development environment.</p>
              <p>If you received this, Resend is configured correctly!</p>
            </div>
          </body>
        </html>
      `,
      text: 'This is a test email sent from your local development environment. If you received this, Resend is configured correctly!',
    })

    if (result.error) {
      console.error('❌ Resend API error:', result.error)
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log(`   Email ID: ${result.data?.id}`)
    console.log(`   From: ${from}`)
    console.log(`   To: arthurzhuk@gmail.com`)
    console.log('\nCheck your email inbox!')
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message)
    console.error('   Stack:', error.stack)
    process.exit(1)
  }
}

testResend()

