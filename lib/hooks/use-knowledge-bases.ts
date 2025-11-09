import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type KnowledgeBase = {
  id: string
  source: string
  sourceType: string
  chunksCount: number
  lastCrawled: string | null
  createdAt: string
}

async function fetchKnowledgeBases(tenantId: string): Promise<KnowledgeBase[]> {
  const response = await fetch(`/api/knowledge/list?tenantId=${tenantId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch knowledge bases')
  }
  const data = await response.json()
  return data.knowledgeBases || []
}

export function useKnowledgeBases(tenantId: string) {
  return useQuery({
    queryKey: ['knowledgeBases', tenantId],
    queryFn: () => fetchKnowledgeBases(tenantId),
  })
}

export function useIngestKnowledge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tenantId,
      type,
      url,
      sitemapUrl,
    }: {
      tenantId: string
      type: 'url' | 'sitemap'
      url?: string
      sitemapUrl?: string
    }) => {
      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          type,
          url,
          sitemapUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ingest')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases', variables.tenantId] })
    },
  })
}

