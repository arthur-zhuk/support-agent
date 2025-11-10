import { openai } from '@ai-sdk/openai'
import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { searchKnowledgeBase } from '../rag/search'
import type { ChatMessage } from '@/lib/types/ai'

export async function createAgent({
  tenantId,
  messages,
  onToolCall,
}: {
  tenantId: string
  messages: ChatMessage[]
  onToolCall?: (toolName: string, args: unknown) => void
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.')
  }

  const knowledgeSearchTool = tool({
    description: 'Search the knowledge base for relevant information about policies, FAQs, documentation, and product information',
    inputSchema: z.object({
      query: z.string().describe('The search query to find relevant information'),
    }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchKnowledgeBase({ tenantId, query })
      return {
        results: results.map((r) => ({
          content: r.content,
          source: r.source,
          score: r.score,
        })),
      }
    },
  })

  const systemPrompt = `You are a helpful AI assistant that answers customer questions using the knowledge base.

Your role:
- Answer questions about products, policies, shipping, returns, and FAQs
- Search the knowledge base when you need information
- Be friendly, concise, and helpful
- If you don't know something, say so and suggest they contact support

IMPORTANT: 
- Always search the knowledge base first before answering
- After searching, provide a clear, helpful response based on what you found
- When you use information from the knowledge base, mention the source at the end of your response (e.g., "Source: [source URL]")
- This helps users verify the information and builds trust`

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      maxTokens: 2000,
      tools: {
        searchKnowledgeBase: knowledgeSearchTool,
      },
      stopWhen: stepCountIs(3), // Allow up to 3 tool calls (search, refine, answer)
      onStepFinish: (step) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          step.toolCalls.forEach((toolCall) => {
            const toolName = typeof toolCall.toolName === 'string' ? toolCall.toolName : String(toolCall.toolName)
            const args = (toolCall as { args?: unknown }).args || {}
            onToolCall?.(toolName, args)
          })
        }
      },
      onError: (error) => {
        console.error('StreamText error:', error)
        throw error
      },
    })
    
    return result
  } catch (error) {
    console.error('Error in streamText:', error)
    throw new Error(`Failed to create AI stream: ${error instanceof Error ? error.message : String(error)}`)
  }
}
