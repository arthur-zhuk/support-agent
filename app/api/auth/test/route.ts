import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
  })
}

