import { createAgent } from '@/lib/ai/agent'
import { prisma } from '@/lib/db/prisma'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, tenantId, sessionId } = await req.json()

    if (!tenantId || !sessionId) {
      return new Response('Missing tenantId or sessionId', { status: 400 })
    }

    const citations: string[] = []
    const toolCalls: Array<{ toolName: string; args: unknown }> = []

    const result = await createAgent({
      tenantId,
      messages,
      onToolCall: (toolName, args) => {
        toolCalls.push({ toolName, args })
      },
    })

    const stream = result.toTextStreamResponse()

    result.text.then(async (finalText) => {
      const updatedMessages = [...messages, { role: 'assistant' as const, content: finalText }]

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
      }
    }).catch(console.error)

    return stream
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

