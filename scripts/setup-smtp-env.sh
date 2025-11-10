#!/bin/bash

# Script to set SMTP environment variables in Vercel
# Usage: ./scripts/setup-smtp-env.sh

echo "Setting up SMTP environment variables for Vercel..."
echo ""
echo "Please have your SMTP credentials ready:"
echo "  - SMTP_HOST (e.g., smtp.gmail.com, smtp.sendgrid.net)"
echo "  - SMTP_PORT (e.g., 587 for TLS, 465 for SSL)"
echo "  - SMTP_USER (your SMTP username/email)"
echo "  - SMTP_PASSWORD (your SMTP password or app password)"
echo "  - SMTP_FROM (sender email address, optional)"
echo ""

read -p "Enter SMTP_HOST (e.g., smtp.gmail.com): " SMTP_HOST
read -p "Enter SMTP_PORT (e.g., 587): " SMTP_PORT
read -p "Enter SMTP_USER (your email): " SMTP_USER
read -s -p "Enter SMTP_PASSWORD: " SMTP_PASSWORD
echo ""
read -p "Enter SMTP_FROM (optional, press Enter to skip): " SMTP_FROM

echo ""
echo "Setting environment variables..."

vercel env add SMTP_HOST production <<< "$SMTP_HOST"
vercel env add SMTP_PORT production <<< "$SMTP_PORT"
vercel env add SMTP_USER production <<< "$SMTP_USER"
vercel env add SMTP_PASSWORD production <<< "$SMTP_PASSWORD"

if [ ! -z "$SMTP_FROM" ]; then
  vercel env add SMTP_FROM production <<< "$SMTP_FROM"
fi

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Note: You may need to redeploy your application for changes to take effect."
echo "Run: vercel --prod"

