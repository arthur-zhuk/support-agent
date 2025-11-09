import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { getShopifyTools } from './tools/shopify'
import { getIntercomTools } from './tools/intercom'
import { searchKnowledgeBase } from '../rag/search'

export async function createAgent({
  tenantId,
  messages,
  onToolCall,
}: {
  tenantId: string
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  onToolCall?: (toolName: string, args: unknown) => void
}) {
  const shopifyTools = getShopifyTools(tenantId)
  const intercomTools = getIntercomTools(tenantId)

  const knowledgeSearchTool = tool({
    description: 'Search the knowledge base for relevant information about policies, FAQs, and documentation',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchKnowledgeBase({ tenantId, query })
      return {
        results: results.map((r: any) => ({
          content: r.content,
          source: r.source,
          score: r.score,
        })),
      }
    },
  } as any)

  const allTools = {
    ...shopifyTools,
    ...intercomTools,
    searchKnowledge: knowledgeSearchTool,
  }

  const systemPrompt = \`You are a helpful support agent for an e-commerce store. You can:
- Answer questions about orders, returns, and policies using the knowledge base
- Look up order status and details from Shopify
- Create returns and process cancellations
- Escalate complex issues to human agents via Intercom

Be friendly, concise, and helpful. When you don't know something, search the knowledge base first. If a customer needs human assistance, escalate to Intercom.\`

  return streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
    tools: allTools,
    onStepFinish: (step: any) => {
      if (step.toolCalls && step.toolCalls.length > 0) {
        step.toolCalls.forEach((toolCall: any) => {
          onToolCall?.(toolCall.toolName, toolCall.args || toolCall.parameters)
        })
      }
    },
  } as any)
}

