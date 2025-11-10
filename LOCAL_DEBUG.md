# Local Debugging Guide

## Quick Setup

1. **Create `.env.local` file** in the project root:
```bash
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM=contact@velocityspanlabs.com
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Start the dev server**:
```bash
npm run dev
```

3. **Test Resend directly** (without NextAuth):
```bash
npm run test:resend
```

4. **Test NextAuth sign-in** via API:
```bash
curl -X POST http://localhost:3000/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

5. **Test via browser**:
   - Go to `http://localhost:3000/login`
   - Enter your email
   - Check the browser console (F12) for detailed logs
   - Check the terminal where `npm run dev` is running for server logs

## Debugging Tips

### Check Environment Variables
The test script will show you if env vars are loaded correctly:
```bash
npm run test:resend
```

### Check Server Logs
When running `npm run dev`, you'll see logs like:
- `[Auth Config] getEmailProvider called:` - Shows if API key is detected
- `[ResendEmailProvider] sendVerificationRequest called:` - Shows when email is being sent
- `[NextAuth Route]` - Shows NextAuth initialization

### Check Browser Console
Open browser DevTools (F12) → Console tab to see:
- `[Login] signIn error:` - Shows what error NextAuth returned
- `[Login] Unexpected signIn result:` - Shows unexpected responses

### Test API Endpoint
The `/api/test-auth` endpoint lets you test sign-in without the UI:
```bash
curl -X POST http://localhost:3000/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq
```

This will return:
```json
{
  "success": true/false,
  "error": "error message or null",
  "url": "redirect URL or null"
}
```

## Common Issues

### Environment variables not loading
- Make sure `.env.local` exists in the project root
- Restart the dev server after changing `.env.local`
- Check that variables don't have trailing spaces/newlines

### "Configuration" error
- Verify `RESEND_API_KEY` is set correctly
- Check that the API key doesn't have extra quotes or spaces
- Run `npm run test:resend` to verify Resend works independently

### Email not sending
- Check Resend dashboard for API errors
- Verify the sender email domain is verified in Resend
- Check server logs for Resend API responses

