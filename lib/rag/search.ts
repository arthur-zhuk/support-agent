import { prisma } from '@/lib/db/prisma'

async function generateEmbedding(text: string): Promise<number[]> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

export async function searchKnowledgeBase({
  tenantId,
  query,
  limit = 5,
}: {
  tenantId: string
  query: string
  limit?: number
}) {
  const queryEmbedding = await generateEmbedding(query)
  const embeddingString = `[${queryEmbedding.join(',')}]`

  const chunks = await prisma.$queryRaw<Array<{
    id: string
    content: string
    knowledgeBaseId: string
    source: string
    score: number
  }>>`
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
  ` as any

  return chunks.map((chunk: any) => ({
    id: chunk.id,
    content: chunk.content,
    source: chunk.source,
    score: Number(chunk.score),
  }))
}

