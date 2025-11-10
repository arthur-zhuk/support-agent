# Update NEXTAUTH_URL Environment Variable

The production URL should be `https://support-agent-gules.vercel.app`

## Update in Vercel

Run these commands to set the correct URL:

```bash
# Set NEXTAUTH_URL for production
vercel env add NEXTAUTH_URL production
# When prompted, enter: https://support-agent-gules.vercel.app

# Or update via Vercel dashboard:
# 1. Go to https://vercel.com/your-team/support-agent/settings/environment-variables
# 2. Find NEXTAUTH_URL
# 3. Update to: https://support-agent-gules.vercel.app
# 4. Redeploy
```

This ensures magic link emails contain the correct callback URL.

