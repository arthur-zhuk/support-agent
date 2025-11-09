'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Copy, CheckCircle2, AlertCircle } from 'lucide-react'

export default function KnowledgePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const handleIngest = async () => {
    if (!url) return

    setLoading(true)
    setMessage('')

    try {
      const tenantId = 'demo-tenant'
      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ingest')
      }

      setMessage('Successfully ingested!')
      setUrl('')
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" />
              <CardTitle>Add Content</CardTitle>
            </div>
            <CardDescription>
              Ingest URLs, sitemaps, or files to build your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL or Sitemap</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/docs"
                  onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
                />
                <Button onClick={handleIngest} disabled={loading || !url}>
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
    </div>
  )
}

