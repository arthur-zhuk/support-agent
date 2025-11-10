# Resend Email Setup Guide

## Quick Setup with Vercel CLI

Set your Resend API key and sender email:

```bash
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM production
```

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign in
2. Navigate to **API Keys** in your dashboard
3. Create a new API key
4. Copy the API key (starts with `re_`)

## Setting Up Your Sender Email

1. In Resend dashboard, go to **Domains**
2. Add and verify your domain, OR
3. Use Resend's test domain: `onboarding@resend.dev` (for testing only)

**Important**: For production, you must verify your own domain in Resend.

## Environment Variables

Set these in Vercel:

- **RESEND_API_KEY**: Your Resend API key (starts with `re_`)
- **RESEND_FROM**: Your verified sender email (e.g., `noreply@yourdomain.com`)

## After Setting Variables

1. Redeploy your application:
   ```bash
   vercel --prod
   ```

2. Or trigger a redeploy from the Vercel dashboard

## Why Resend?

✅ **Simpler setup** - Just 2 environment variables  
✅ **Better deliverability** - Built for transactional emails  
✅ **Modern API** - No SMTP configuration needed  
✅ **Free tier** - 3,000 emails/month free  
✅ **Great for Next.js** - Designed for modern apps  

## Troubleshooting

- Make sure `RESEND_API_KEY` is set for the `production` environment
- Verify your sender domain in Resend dashboard
- Check Vercel deployment logs for Resend API errors
- Ensure your Resend account is active and not rate-limited

