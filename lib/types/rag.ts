export type KnowledgeBaseChunk = {
  id: string
  content: string
  source: string
  score: number
}

export type SitemapUrl = {
  loc: string[]
}

export type SitemapData = {
  url: SitemapUrl | SitemapUrl[]
}

