import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

async function getIntercomClient(tenantId: string) {
  const connection = await prisma.connection.findFirst({
    where: {
      tenantId,
      type: 'intercom',
    },
  })

  if (connection) {
    return {
      accessToken: connection.token,
    }
  }

  const fallbackToken = process.env.INTERCOM_ACCESS_TOKEN
  if (fallbackToken) {
    return {
      accessToken: fallbackToken,
    }
  }

  throw new Error('Intercom connection not found. Please connect Intercom in the dashboard.')
}

export function getIntercomTools(tenantId: string) {
  return {
    createTicket: tool({
      description: 'Create a support ticket in Intercom with full conversation context',
      parameters: z.object({
        subject: z.string().describe('Ticket subject'),
        body: z.string().describe('Ticket body with full context'),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
        assigneeId: z.string().optional(),
      }),
      execute: async ({ subject, body, priority, assigneeId }: any) => {
        const client = await getIntercomClient(tenantId)

        const response = await fetch('https://api.intercom.io/conversations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            type: 'ticket',
            ticket_attributes: {
              _default_title_: subject,
              _default_description_: body,
              priority: priority || 'normal',
            },
            assignee_id: assigneeId,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          return { error: `Failed to create ticket: ${error}` }
        }

        const data = await response.json()
        return {
          success: true,
          ticketId: data.id,
          ticketNumber: data.ticket_attributes?._default_title_,
        }
      },
    } as any),

    escalateToHuman: tool({
      description: 'Escalate the conversation to a human agent in Intercom with full context',
      parameters: z.object({
        conversationId: z.string().optional(),
        message: z.string().describe('Summary of why escalation is needed'),
        transcript: z.string().describe('Full conversation transcript'),
        customerEmail: z.string().email().optional(),
      }),
      execute: async ({ conversationId, message, transcript, customerEmail }: any) => {
        const client = await getIntercomClient(tenantId)

        const escalationBody = `Escalation Request: ${message}\n\nConversation Transcript:\n${transcript}`

        const response = await fetch('https://api.intercom.io/conversations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            type: 'conversation',
            from: customerEmail ? {
              type: 'user',
              email: customerEmail,
            } : undefined,
            body: escalationBody,
            assignee_id: null,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          return { error: `Failed to escalate: ${error}` }
        }

        const data = await response.json()
        return {
          success: true,
          conversationId: data.id,
          message: 'Conversation escalated to human agent. They will respond shortly.',
        }
      },
    } as any),
  }
}

