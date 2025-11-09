import { prisma } from '@/lib/db/prisma'
import * as cheerio from 'cheerio'
import SitemapParser from 'sitemap-parser'
import type { SitemapData, SitemapUrl } from '@/lib/types/rag'
import { Prisma } from '@prisma/client'
import { randomBytes } from 'crypto'
import { Client } from 'pg'

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
  const maxChunks = 10000

  while (start < text.length && chunks.length < maxChunks) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    if (chunk.length > 0) {
      chunks.push(chunk)
    }
    const nextStart = end - overlap
    if (nextStart <= start) {
      start = end
    } else {
      start = nextStart
    }
    if (start >= text.length) break
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

  const embedding = response.data[0]?.embedding
  if (!embedding || embedding.length !== 1536) {
    throw new Error(`Invalid embedding: expected length 1536, got ${embedding?.length || 0}`)
  }
  
  return embedding
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
    if (!chunk.trim()) continue
    
    const embedding = await generateEmbedding(chunk)
    
    if (!embedding || embedding.length !== 1536) {
      console.error(`Invalid embedding length: ${embedding?.length}, expected 1536`)
      continue
    }

    const embeddingString = `[${embedding.join(',')}]`
    const chunkId = randomBytes(16).toString('hex')
    
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (dbUrl) {
      const pgClient = new Client({ connectionString: dbUrl })
      await pgClient.connect()
      try {
        await pgClient.query(
          `INSERT INTO "Chunk" (id, "knowledgeBaseId", content, embedding, metadata, "createdAt")
           VALUES ($1, $2, $3, $4::vector, $5::jsonb, NOW())`,
          [chunkId, knowledgeBase.id, chunk, embeddingString, JSON.stringify({ source: url, title })]
        )
      } finally {
        await pgClient.end()
      }
    } else {
      throw new Error('DATABASE_URL not configured')
    }
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
    parser.parse(sitemapUrl, (err: Error | null, sitemap: SitemapData | null) => {
      if (err) {
        reject(err)
        return
      }
      if (sitemap && sitemap.url) {
        const urlArray = Array.isArray(sitemap.url) ? sitemap.url : [sitemap.url]
        urlArray.forEach((item: SitemapUrl) => {
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
    if (!chunk.trim()) continue
    
    const embedding = await generateEmbedding(chunk)
    
    if (!embedding || embedding.length !== 1536) {
      console.error(`Invalid embedding length: ${embedding?.length}, expected 1536`)
      continue
    }

    const embeddingString = `[${embedding.join(',')}]`
    const chunkId = randomBytes(16).toString('hex')
    
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (dbUrl) {
      const pgClient = new Client({ connectionString: dbUrl })
      await pgClient.connect()
      try {
        await pgClient.query(
          `INSERT INTO "Chunk" (id, "knowledgeBaseId", content, embedding, metadata, "createdAt")
           VALUES ($1, $2, $3, $4::vector, $5::jsonb, NOW())`,
          [chunkId, knowledgeBase.id, chunk, embeddingString, JSON.stringify({ source: fileName })]
        )
      } finally {
        await pgClient.end()
      }
    } else {
      throw new Error('DATABASE_URL not configured')
    }
  }

  return { knowledgeBaseId: knowledgeBase.id, chunksCount: chunks.length }
}

