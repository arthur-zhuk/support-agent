import { Resend } from 'resend'
import type { EmailConfig, EmailUserConfig } from 'next-auth/providers/email'

export function ResendEmailProvider(options: EmailUserConfig): EmailConfig {
  const from = options.from || process.env.RESEND_FROM || 'noreply@support-agent.com'

  // Don't initialize Resend here - do it lazily in sendVerificationRequest
  // This prevents errors during module initialization when env vars might not be available

  return {
    id: 'email',
    type: 'email',
    name: 'Email',
    server: {
      host: 'resend.com',
      port: 587,
      auth: {
        user: 'resend',
        pass: 'resend',
      },
    },
    from,
    async sendVerificationRequest({ identifier: email, url, provider }) {
      const senderEmail = provider.from as string
      
      // Log ALL environment variables that start with RESEND or SMTP for debugging
      const relevantEnvVars = Object.keys(process.env)
        .filter(key => key.includes('RESEND') || key.includes('SMTP'))
        .reduce((acc, key) => {
          const value = process.env[key]
          if (value) {
            acc[key] = key.includes('KEY') || key.includes('PASSWORD') 
              ? `${value.substring(0, 10)}...` 
              : value
          }
          return acc
        }, {} as Record<string, string>)
      
      const apiKey = process.env.RESEND_API_KEY
      
      console.log('[ResendEmailProvider] sendVerificationRequest called:', {
        from: senderEmail,
        to: email,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        relevantEnvVars,
      })
      
      if (!apiKey) {
        const errorMsg = 'Email service is not configured. RESEND_API_KEY is missing. Please set RESEND_API_KEY and RESEND_FROM environment variables in your Vercel project settings.'
        console.error('[ResendEmailProvider] Configuration error:', {
          errorMsg,
          hasApiKey: !!apiKey,
          relevantEnvVars,
          allEnvKeys: Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('SMTP')),
        })
        // Throw Configuration error so NextAuth recognizes it properly
        const error: any = new Error(errorMsg)
        error.type = 'Configuration'
        throw error
      }

      const resend = new Resend(apiKey)
      
      console.log('[ResendEmailProvider] Sending email via Resend:', {
        from: senderEmail,
        to: email,
      })

      try {
        const result = await resend.emails.send({
          from: senderEmail,
          to: email,
          subject: 'Sign in to your account',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #2563eb;">Sign in to your account</h1>
                  <p>Click the button below to sign in to your account:</p>
                  <p style="margin: 30px 0;">
                    <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Sign in</a>
                  </p>
                  <p style="color: #666; font-size: 14px;">Or copy and paste this URL into your browser:</p>
                  <p style="color: #666; font-size: 14px; word-break: break-all;">${url}</p>
                  <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
                </div>
              </body>
            </html>
          `,
          text: `Sign in to your account\n\nClick this link to sign in: ${url}\n\nThis link will expire in 24 hours.`,
        })

        if (result.error) {
          console.error('Resend API error:', result.error)
          throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`)
        }

        console.log('Email sent successfully via Resend:', result.data?.id)
      } catch (error: any) {
        console.error('Failed to send email via Resend:', {
          error: error.message,
          stack: error.stack,
          from: senderEmail,
          to: email,
        })
        throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
      }
    },
    options,
  }
}

