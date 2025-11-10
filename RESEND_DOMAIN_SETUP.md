# Resend Domain Verification

## Important: Verify Your Domain

Before `contact@velocityspanlabs.com` can send emails, you need to verify the domain `velocityspanlabs.com` in Resend.

## Steps to Verify Domain:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter `velocityspanlabs.com`
4. Add the DNS records Resend provides to your domain's DNS settings:
   - **SPF Record** (TXT)
   - **DKIM Records** (CNAME)
   - **DMARC Record** (TXT) - Optional but recommended

5. Wait for verification (usually takes a few minutes)

## Testing Without Domain Verification

If you want to test immediately, you can temporarily use Resend's test domain:

```bash
vercel env rm RESEND_FROM production --yes
echo "onboarding@resend.dev" | vercel env add RESEND_FROM production
vercel --prod
```

Then switch back to your domain once verified:

```bash
vercel env rm RESEND_FROM production --yes
echo "contact@velocityspanlabs.com" | vercel env add RESEND_FROM production
vercel --prod
```

## After Domain Verification

Once your domain is verified in Resend:
1. Make sure `RESEND_FROM` is set to `contact@velocityspanlabs.com`
2. Redeploy: `vercel --prod`
3. Try sending a magic link again

## Check Deployment Logs

If emails still don't work, check Vercel deployment logs for:
- Resend API errors
- Domain verification errors
- API key issues

