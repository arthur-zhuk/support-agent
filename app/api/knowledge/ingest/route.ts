import { ingestUrl, ingestSitemap } from '@/lib/rag/ingest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url, sitemapUrl, tenantId, type } = await req.json()

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    if (type === 'sitemap') {
      if (!sitemapUrl) {
        return NextResponse.json({ error: 'Missing sitemapUrl' }, { status: 400 })
      }
      const result = await ingestSitemap({ tenantId, sitemapUrl })
      return NextResponse.json(result)
    } else {
      if (!url) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 })
      }
      const result = await ingestUrl({ tenantId, url })
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Ingest error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error stack:', errorStack)
    return NextResponse.json(
      { error: errorMessage, stack: process.env.NODE_ENV === 'development' ? errorStack : undefined },
      { status: 500 }
    )
  }
}

