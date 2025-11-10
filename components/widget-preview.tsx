'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface WidgetPreviewProps {
  tenantId: string
}

export function WidgetPreview({ tenantId }: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI support agent. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updatedMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          sessionId: `preview-${tenantId}`,
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Chat API error:', errorText)
            let errorMessage = `Failed to get response: ${response.status}`
            let suggestion = ''
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.error || errorJson.details || errorMessage
              suggestion = errorJson.suggestion || ''
            } catch {
              errorMessage = errorText || errorMessage
            }
            const fullError = suggestion ? `${errorMessage}. ${suggestion}` : errorMessage
            throw new Error(fullError)
          }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''
      let hasReceivedData = false

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        hasReceivedData = true
        const chunk = decoder.decode(value, { stream: true })
        
        if (chunk.trim()) {
          assistantMessage += chunk
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
              newMessages[newMessages.length - 1] = {
                role: 'assistant',
                content: assistantMessage,
              }
            }
            return newMessages
          })
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }

      console.log('Stream complete. Has data:', hasReceivedData, 'Message length:', assistantMessage.length)

      if (!assistantMessage.trim()) {
        console.error('No assistant message received.')
        const errorMsg = hasReceivedData 
          ? 'I received your message, but the response stream was empty. Please check that OPENAI_API_KEY is set correctly.'
          : 'I received your message, but I didn\'t get a response. Please check your API configuration.'
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content.trim()) {
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: errorMsg,
            }
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isOpen ? 'w-[380px] h-[600px]' : 'w-auto h-auto'
        }`}
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-[60px] h-[60px] rounded-full bg-[#0070f3] text-white border-none cursor-pointer shadow-lg text-2xl flex items-center justify-center hover:bg-[#0051cc] transition-colors"
            aria-label="Open support chat"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl flex flex-col h-full border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Support</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-[#0070f3] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-[#0070f3] hover:bg-[#0051cc]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function WidgetPreviewCard({ tenantId }: WidgetPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Widget Preview</CardTitle>
          <CardDescription>
            See how your support widget will appear to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to preview the widget. It will appear in the
              bottom-right corner, just like it will for your customers.
            </p>
            <Button onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            {showPreview && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Look for the chat button in the bottom-right corner →
                </p>
                <p className="text-xs text-muted-foreground">
                  The preview widget is fully functional and will use your actual
                  knowledge base and integrations.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {showPreview && <WidgetPreview tenantId={tenantId} />}
    </>
  )
}


