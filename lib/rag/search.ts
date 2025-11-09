import { prisma } from '@/lib/db/prisma'
import type { KnowledgeBaseChunk } from '@/lib/types/rag'

async function generateEmbedding(text: string): Promise<number[]> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

type RawChunkResult = {
  id: string
  content: string
  knowledgeBaseId: string
  source: string
  score: number | string
}

export async function searchKnowledgeBase({
  tenantId,
  query,
  limit = 5,
}: {
  tenantId: string
  query: string
  limit?: number
}): Promise<KnowledgeBaseChunk[]> {
  const queryEmbedding = await generateEmbedding(query)
  const embeddingString = `[${queryEmbedding.join(',')}]`

  const chunks = await prisma.$queryRaw<RawChunkResult[]>`
    SELECT 
      c.id,
      c.content,
      c."knowledgeBaseId",
      kb.source,
      1 - (c.embedding <=> ${embeddingString}::vector) as score
    FROM "Chunk" c
    JOIN "KnowledgeBase" kb ON c."knowledgeBaseId" = kb.id
    WHERE kb."tenantId" = ${tenantId}
    ORDER BY c.embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `

  return chunks.map((chunk): KnowledgeBaseChunk => ({
    id: chunk.id,
    content: chunk.content,
    source: chunk.source,
    score: Number(chunk.score),
  }))
}

