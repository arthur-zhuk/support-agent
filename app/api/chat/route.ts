import { createAgent } from '@/lib/ai/agent'
import { prisma } from '@/lib/db/prisma'
import { trackConversationWithCost, trackToolRun } from '@/lib/metrics/tracker'
import { NextRequest } from 'next/server'
import type { ConversationMessage } from '@/lib/types/prisma'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { messages, tenantId, sessionId } = await req.json()

    if (!tenantId || !sessionId) {
      return new Response('Missing tenantId or sessionId', { status: 400 })
    }

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        tenantId_sessionId: {
          tenantId,
          sessionId,
        },
      },
    })

    const existingMessages = (existingConversation?.messages as ConversationMessage[]) || []
    const allMessages: ConversationMessage[] = [
      ...existingMessages,
      ...(messages as ConversationMessage[]),
    ]

    const citations: string[] = []
    const toolCalls: Array<{ toolName: string; args: unknown }> = []
    let wasEscalated = false

    let result
    try {
      result = await createAgent({
        tenantId,
        messages: allMessages,
        onToolCall: (toolName, args) => {
          toolCalls.push({ toolName, args })
          if (toolName === 'searchKnowledgeBase' && args && typeof args === 'object' && 'results' in args) {
            const results = args.results as Array<{ source?: string }>
            if (Array.isArray(results)) {
              results.forEach((r) => {
                if (r.source && !citations.includes(r.source)) {
                  citations.push(r.source)
                }
              })
            }
          }
          if (toolName === 'escalateToHuman' || toolName === 'createTicket') {
            wasEscalated = true
          }
        },
      })
    } catch (error) {
      console.error('Error creating agent:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const statusCode = errorMessage.includes('quota') || errorMessage.includes('429') ? 429 : 500
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create agent', 
          details: errorMessage,
          suggestion: errorMessage.includes('quota') ? 'Please check your OpenAI account billing and add credits.' : undefined
        }),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!result) {
      console.error('Agent result is null or undefined')
      return new Response(
        JSON.stringify({ error: 'Agent result is null' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating stream response...')
    let stream
    try {
      stream = result.toTextStreamResponse()
      console.log('Stream created:', {
        hasBody: !!stream?.body,
        contentType: stream?.headers.get('content-type'),
        headers: Object.fromEntries(stream?.headers.entries() || []),
      })
    } catch (error) {
      console.error('Error creating stream response:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create stream', details: error instanceof Error ? error.message : String(error) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!stream || !stream.body) {
      console.error('Stream is null or has no body', { stream: !!stream, body: !!stream?.body })
      return new Response(
        JSON.stringify({ error: 'Stream is invalid' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Returning stream response')

    result.text
      .then(async (finalText) => {
        console.log('Stream completed, final text length:', finalText?.length || 0)
        const updatedMessages = [...allMessages, { role: 'assistant' as const, content: finalText }]

        await prisma.conversation.upsert({
          where: {
            tenantId_sessionId: {
              tenantId,
              sessionId,
            },
          },
          create: {
            tenantId,
            sessionId,
            messages: updatedMessages as Prisma.InputJsonValue[],
            citations,
          },
          update: {
            messages: updatedMessages as Prisma.InputJsonValue[],
            citations,
          },
        })

        for (const toolCall of toolCalls) {
          try {
            await prisma.toolRun.create({
              data: {
                tenantId,
                conversationId: sessionId,
                toolName: toolCall.toolName,
                args: (toolCall.args || {}) as Prisma.InputJsonValue,
                success: true,
              },
            })
            await trackToolRun(tenantId, true)
          } catch (error) {
            console.error('Error saving tool run:', error)
          }
        }

        const wasDeflected = !wasEscalated && toolCalls.length === 0
        await trackConversationWithCost(tenantId, updatedMessages, wasDeflected, wasEscalated)
      })
      .catch((error) => {
        console.error('Error processing stream result:', error)
      })

    result.response.catch((error) => {
      console.error('Error in stream response:', error)
    })

    return stream
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

