export type IntercomConversationResponse = {
  id: string
  ticket_attributes?: {
    _default_title_?: string
    _default_description_?: string
    priority?: string
  }
}

export type IntercomTicketParams = {
  subject: string
  body: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  assigneeId?: string
}

export type IntercomEscalationParams = {
  conversationId?: string
  message: string
  transcript: string
  customerEmail?: string
}

