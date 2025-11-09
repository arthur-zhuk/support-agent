import { createAgent } from '@/lib/ai/agent'
import { prisma } from '@/lib/db/prisma'
import { trackConversationWithCost, trackToolRun } from '@/lib/metrics/tracker'
import { NextRequest } from 'next/server'

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

    const allMessages = existingConversation
      ? [...(existingConversation.messages as Array<{ role: string; content: string }>), ...messages]
      : messages

    const citations: string[] = []
    const toolCalls: Array<{ toolName: string; args: unknown }> = []
    let wasEscalated = false

    const result = await createAgent({
      tenantId,
      messages: allMessages,
      onToolCall: (toolName, args) => {
        toolCalls.push({ toolName, args })
        if (toolName === 'escalateToHuman' || toolName === 'createTicket') {
          wasEscalated = true
        }
      },
    })

    const stream = result.toTextStreamResponse()

    result.text.then(async (finalText) => {
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
          messages: updatedMessages as any[],
          citations,
        },
        update: {
          messages: updatedMessages as any[],
          citations,
        },
      })

      for (const toolCall of toolCalls) {
        await prisma.toolRun.create({
          data: {
            tenantId,
            conversationId: sessionId,
            toolName: toolCall.toolName,
            args: toolCall.args as any,
            success: true,
          },
        })
        await trackToolRun(tenantId, true)
      }

      const wasDeflected = !wasEscalated && toolCalls.length === 0
      await trackConversationWithCost(tenantId, updatedMessages, wasDeflected, wasEscalated)
    }).catch(console.error)

    return stream
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

