import { Resend } from 'resend'
import type { EmailConfig, EmailUserConfig } from 'next-auth/providers/email'

export function ResendEmailProvider(options: EmailUserConfig): EmailConfig {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = options.from || process.env.RESEND_FROM || 'noreply@support-agent.com'

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
      try {
        const result = await resend.emails.send({
          from: provider.from as string,
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
          throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`)
        }
      } catch (error: any) {
        console.error('Failed to send email via Resend:', error)
        throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
      }
    },
    options,
  }
}

