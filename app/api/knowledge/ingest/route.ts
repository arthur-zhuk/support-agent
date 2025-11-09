import { ingestUrl } from '@/lib/rag/ingest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url, tenantId } = await req.json()

    if (!url || !tenantId) {
      return NextResponse.json({ error: 'Missing url or tenantId' }, { status: 400 })
    }

    const result = await ingestUrl({ tenantId, url })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Ingest error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

