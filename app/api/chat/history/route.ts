import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const sessionId = searchParams.get('sessionId')

    if (!tenantId || !sessionId) {
      return NextResponse.json({ error: 'Missing tenantId or sessionId' }, { status: 400 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        tenantId_sessionId: {
          tenantId,
          sessionId,
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ messages: [] })
    }

    return NextResponse.json({
      messages: conversation.messages as Array<{ role: string; content: string }>,
    })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

