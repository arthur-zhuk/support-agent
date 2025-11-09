import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { lastCrawled: 'desc' },
    })

    return NextResponse.json({
      knowledgeBases: knowledgeBases.map((kb) => ({
        id: kb.id,
        source: kb.source,
        sourceType: kb.sourceType,
        chunksCount: kb._count.chunks,
        lastCrawled: kb.lastCrawled,
        createdAt: kb.createdAt,
        metadata: kb.metadata,
      })),
    })
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

