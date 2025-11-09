'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Copy, CheckCircle2, AlertCircle, Globe, FileText, RefreshCw } from 'lucide-react'

type KnowledgeBase = {
  id: string
  source: string
  sourceType: string
  chunksCount: number
  lastCrawled: string | null
  createdAt: string
}

export default function KnowledgePage() {
  const [url, setUrl] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [ingestType, setIngestType] = useState<'url' | 'sitemap'>('url')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])

  const loadKnowledgeBases = async () => {
    try {
      const tenantId = 'demo-tenant'
      const response = await fetch(`/api/knowledge/list?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBases(data.knowledgeBases || [])
      }
    } catch (error) {
      console.error('Failed to load knowledge bases:', error)
    }
  }

  useEffect(() => {
    loadKnowledgeBases()
  }, [])

  const handleIngest = async () => {
    if (ingestType === 'url' && !url) return
    if (ingestType === 'sitemap' && !sitemapUrl) return

    setLoading(true)
    setMessage('')

    try {
      const tenantId = 'demo-tenant'
      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          type: ingestType,
          url: ingestType === 'url' ? url : undefined,
          sitemapUrl: ingestType === 'sitemap' ? sitemapUrl : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ingest')
      }

      setMessage('Successfully ingested!')
      setUrl('')
      setSitemapUrl('')
      await loadKnowledgeBases()
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/embed?tenantId=demo-tenant"></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Add documentation and help content to power your support agent
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" />
              <CardTitle>Add Content</CardTitle>
            </div>
            <CardDescription>
              Ingest URLs or sitemaps to build your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={ingestType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIngestType('url')}
              >
                <Globe className="h-4 w-4 mr-2" />
                URL
              </Button>
              <Button
                variant={ingestType === 'sitemap' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIngestType('sitemap')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Sitemap
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {ingestType === 'url' ? 'URL' : 'Sitemap URL'}
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={ingestType === 'url' ? url : sitemapUrl}
                  onChange={(e) => {
                    if (ingestType === 'url') {
                      setUrl(e.target.value)
                    } else {
                      setSitemapUrl(e.target.value)
                    }
                  }}
                  placeholder={ingestType === 'url' ? 'https://example.com/docs' : 'https://example.com/sitemap.xml'}
                  onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
                />
                <Button onClick={handleIngest} disabled={loading || (ingestType === 'url' ? !url : !sitemapUrl)}>
                  {loading ? 'Ingesting...' : 'Add'}
                </Button>
              </div>
            </div>
            {message && (
              <div className={`flex items-center gap-2 text-sm ${
                message.includes('Error') ? 'text-destructive' : 'text-green-600'
              }`}>
                {message.includes('Error') ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>{message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embed Widget</CardTitle>
            <CardDescription>
              Copy this code to embed the support agent on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                {embedCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Bases</CardTitle>
              <CardDescription>
                Your ingested content sources
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadKnowledgeBases}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {knowledgeBases.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No knowledge bases yet</p>
          ) : (
            <div className="space-y-4">
              {knowledgeBases.map((kb) => (
                <div key={kb.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    {kb.sourceType === 'url' ? (
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{kb.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {kb.chunksCount} chunks • {kb.sourceType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {kb.lastCrawled && (
                      <Badge variant="outline">
                        {new Date(kb.lastCrawled).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
