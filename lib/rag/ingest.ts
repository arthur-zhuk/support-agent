import { prisma } from '@/lib/db/prisma'
import * as cheerio from 'cheerio'
import SitemapParser from 'sitemap-parser'

async function fetchAndParseUrl(url: string): Promise<{ content: string; title: string }> {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  $('script, style, nav, footer, header').remove()

  const title = $('title').text() || $('h1').first().text() || 'Untitled'
  const content = $('body').text().replace(/\s+/g, ' ').trim()

  return { content, title }
}

async function chunkText(text: string, chunkSize = 1000, overlap = 200): Promise<string[]> {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap
  }

  return chunks
}

async function generateEmbedding(text: string): Promise<number[]> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

export async function ingestUrl({
  tenantId,
  url,
}: {
  tenantId: string
  url: string
}) {
  const { content, title } = await fetchAndParseUrl(url)

  const existing = await prisma.knowledgeBase.findUnique({
    where: {
      tenantId_source: {
        tenantId,
        source: url,
      },
    },
  })

  const knowledgeBase = existing || await prisma.knowledgeBase.create({
    data: {
      tenantId,
      source: url,
      sourceType: 'url',
      metadata: { title },
      lastCrawled: new Date(),
    },
  })

  if (existing) {
    await prisma.knowledgeBase.update({
      where: { id: existing.id },
      data: {
        lastCrawled: new Date(),
        metadata: { title },
      },
    })
  }

  const chunks = await chunkText(content)

  await prisma.chunk.deleteMany({
    where: { knowledgeBaseId: knowledgeBase.id },
  })

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk)

    await (prisma as any).chunk.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        content: chunk,
        embedding: `[${embedding.join(',')}]`,
        metadata: { source: url, title },
      },
    })
  }

  return { knowledgeBaseId: knowledgeBase.id, chunksCount: chunks.length }
}

export async function ingestSitemap({
  tenantId,
  sitemapUrl,
}: {
  tenantId: string
  sitemapUrl: string
}) {
  const parser = new SitemapParser()
  const urls: string[] = []
  
  return new Promise<string[]>((resolve, reject) => {
    parser.parse(sitemapUrl, (err: Error | null, sitemap: any) => {
      if (err) {
        reject(err)
        return
      }
      if (sitemap && sitemap.url) {
        const urlArray = Array.isArray(sitemap.url) ? sitemap.url : [sitemap.url]
        urlArray.forEach((item: any) => {
          if (item.loc && item.loc[0]) {
            urls.push(item.loc[0])
          }
        })
      }
      resolve(urls)
    })
  }).then(async (urls) => {
    const results = []

    for (const url of urls.slice(0, 50)) {
      try {
        const result = await ingestUrl({ tenantId, url })
        results.push(result)
      } catch (error) {
        console.error(`Failed to ingest ${url}:`, error)
      }
    }

    return results
  })
}

export async function ingestFile({
  tenantId,
  fileName,
  content,
}: {
  tenantId: string
  fileName: string
  content: string
}) {
  const existing = await prisma.knowledgeBase.findUnique({
    where: {
      tenantId_source: {
        tenantId,
        source: fileName,
      },
    },
  })

  const knowledgeBase = existing || await prisma.knowledgeBase.create({
    data: {
      tenantId,
      source: fileName,
      sourceType: 'file',
      lastCrawled: new Date(),
    },
  })

  if (existing) {
    await prisma.knowledgeBase.update({
      where: { id: existing.id },
      data: {
        lastCrawled: new Date(),
      },
    })
  }

  const chunks = await chunkText(content)

  await prisma.chunk.deleteMany({
    where: { knowledgeBaseId: knowledgeBase.id },
  })

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk)

    await (prisma as any).chunk.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        content: chunk,
        embedding: `[${embedding.join(',')}]`,
        metadata: { source: fileName },
      },
    })
  }

  return { knowledgeBaseId: knowledgeBase.id, chunksCount: chunks.length }
}

