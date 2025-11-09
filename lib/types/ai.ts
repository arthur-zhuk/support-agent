import type { CoreMessage } from 'ai'

export type ChatMessage = CoreMessage

export type ToolCall = {
  toolName: string
  args: unknown
  parameters?: unknown
}

export type StreamTextStep = {
  toolCalls?: ToolCall[]
}

