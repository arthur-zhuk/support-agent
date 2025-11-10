'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Copy, CheckCircle2, AlertCircle, Globe, FileText, RefreshCw } from 'lucide-react'
import { useKnowledgeBases, useIngestKnowledge } from '@/lib/hooks/use-knowledge-bases'
import { toast } from 'sonner'
import { useTenantId } from '@/lib/hooks/use-tenant'
import { WidgetPreviewCard } from '@/components/widget-preview'

export default function KnowledgePage() {
  const { tenantId, loading: tenantLoading } = useTenantId()
  const [url, setUrl] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [ingestType, setIngestType] = useState<'url' | 'sitemap'>('url')
  const [copied, setCopied] = useState(false)

  const { data: knowledgeBases = [], isLoading, refetch } = useKnowledgeBases(tenantId || '')
  const ingestMutation = useIngestKnowledge()

  if (tenantLoading || !tenantId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleIngest = async () => {
    if (ingestType === 'url' && !url) return
    if (ingestType === 'sitemap' && !sitemapUrl) return

    try {
      await ingestMutation.mutateAsync({
        tenantId,
        type: ingestType,
        url: ingestType === 'url' ? url : undefined,
        sitemapUrl: ingestType === 'sitemap' ? sitemapUrl : undefined,
      })
      toast.success('Successfully ingested!')
      setUrl('')
      setSitemapUrl('')
    } catch (error) {
      toast.error('Error: ' + (error as Error).message)
    }
  }

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  }
  
  const embedCode = `<script src="${getBaseUrl()}/api/embed?tenantId=${tenantId}"></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Automatically ingest your help docs, FAQs, and documentation. No manual entry needed—just add URLs, sitemaps, or files and your AI assistant learns instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <WidgetPreviewCard tenantId={tenantId} />
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" />
              <CardTitle>Add Content</CardTitle>
            </div>
            <CardDescription>
              Automatically crawl and index your documentation. Add URLs, sitemaps, or files—we&apos;ll extract, chunk, and make it searchable instantly.
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
                <Button
                  onClick={handleIngest}
                  disabled={ingestMutation.isPending || (ingestType === 'url' ? !url : !sitemapUrl)}
                >
                  {ingestMutation.isPending ? 'Ingesting...' : 'Add'}
                </Button>
              </div>
            </div>
            {ingestMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{ingestMutation.error?.message || 'Failed to ingest'}</span>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Embed Widget</CardTitle>
          <CardDescription>
            Copy this one-line script to add an AI-powered support widget to your website. It automatically answers questions from your knowledge base.
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Bases</CardTitle>
              <CardDescription>
                Your ingested content sources
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : knowledgeBases.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No knowledge bases yet</p>
          ) : (
            <div className="space-y-4">
              {knowledgeBases.map((kb) => (
                <div key={kb.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    {kb.sourceType === 'url' ? (
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    ) : kb.sourceType === 'sitemap' ? (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{kb.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {kb.chunksCount} chunks • {kb.sourceType === 'url' ? 'URL' : kb.sourceType === 'sitemap' ? 'Sitemap' : 'File'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {kb.lastCrawled && (
                      <Badge variant="outline" className="text-xs">
                        Updated {new Date(kb.lastCrawled).toLocaleDateString()}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await ingestMutation.mutateAsync({
                            tenantId,
                            type: kb.sourceType === 'sitemap' ? 'sitemap' : 'url',
                            url: kb.sourceType !== 'sitemap' ? kb.source : undefined,
                            sitemapUrl: kb.sourceType === 'sitemap' ? kb.source : undefined,
                          })
                          toast.success('Knowledge base refreshed!')
                        } catch (error) {
                          toast.error('Error: ' + (error as Error).message)
                        }
                      }}
                      disabled={ingestMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${ingestMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
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
