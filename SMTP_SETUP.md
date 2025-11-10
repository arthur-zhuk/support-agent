# SMTP Configuration Guide

## Quick Setup

Run the setup script:
```bash
./scripts/setup-smtp-env.sh
```

Or manually set each variable:
```bash
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production
vercel env add SMTP_FROM production  # Optional
```

## Common SMTP Providers

### Gmail
- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587` (TLS) or `465` (SSL)
- **SMTP_USER**: Your Gmail address
- **SMTP_PASSWORD**: [App Password](https://myaccount.google.com/apppasswords) (not your regular password)
- **SMTP_FROM**: Your Gmail address

### SendGrid
- **SMTP_HOST**: `smtp.sendgrid.net`
- **SMTP_PORT**: `587`
- **SMTP_USER**: `apikey`
- **SMTP_PASSWORD**: Your SendGrid API key
- **SMTP_FROM**: Your verified sender email

### Mailgun
- **SMTP_HOST**: `smtp.mailgun.org`
- **SMTP_PORT**: `587`
- **SMTP_USER**: Your Mailgun SMTP username
- **SMTP_PASSWORD**: Your Mailgun SMTP password
- **SMTP_FROM**: Your verified sender email

### AWS SES
- **SMTP_HOST**: `email-smtp.{region}.amazonaws.com` (e.g., `email-smtp.us-east-1.amazonaws.com`)
- **SMTP_PORT**: `587`
- **SMTP_USER**: Your AWS SES SMTP username
- **SMTP_PASSWORD**: Your AWS SES SMTP password
- **SMTP_FROM**: Your verified sender email

## After Setting Variables

1. Redeploy your application:
   ```bash
   vercel --prod
   ```

2. Or trigger a redeploy from the Vercel dashboard

## Verify Configuration

After deployment, try logging in. If SMTP is configured correctly, you should receive a magic link email.

## Troubleshooting

- Make sure all variables are set for the `production` environment
- Check that your SMTP provider allows connections from Vercel's IP ranges
- Verify that 2FA is enabled if using Gmail (required for app passwords)
- Check Vercel deployment logs for SMTP connection errors

