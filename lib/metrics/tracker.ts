import { prisma } from '@/lib/db/prisma'

export async function trackConversation(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      conversations: 1,
    },
    update: {
      conversations: {
        increment: 1,
      },
    },
  })
}

export async function trackDeflection(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      deflections: 1,
    },
    update: {
      deflections: {
        increment: 1,
      },
    },
  })
}

export async function trackEscalation(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      escalations: 1,
    },
    update: {
      escalations: {
        increment: 1,
      },
    },
  })
}

export async function trackToolRun(tenantId: string, success: boolean) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      toolRuns: 1,
    },
    update: {
      toolRuns: {
        increment: 1,
      },
    },
  })
}

export async function trackCost(tenantId: string, cost: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      costEstimate: cost,
    },
    update: {
      costEstimate: {
        increment: cost,
      },
    },
  })
}

function estimateCostFromMessages(messages: Array<{ role: string; content: string }>): number {
  const totalTokens = messages.reduce((acc, msg) => {
    const tokens = Math.ceil((msg.content?.length || 0) / 4)
    return acc + tokens
  }, 0)

  const inputCost = (totalTokens / 1000000) * 2.50
  const outputCost = (totalTokens / 1000000) * 10.00

  return inputCost + outputCost
}

export async function trackConversationWithCost(
  tenantId: string,
  messages: Array<{ role: string; content: string }>,
  wasDeflected: boolean = false,
  wasEscalated: boolean = false
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cost = estimateCostFromMessages(messages)

  await prisma.metricsDaily.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today,
      },
    },
    create: {
      tenantId,
      date: today,
      conversations: 1,
      deflections: wasDeflected ? 1 : 0,
      escalations: wasEscalated ? 1 : 0,
      costEstimate: cost,
    },
    update: {
      conversations: {
        increment: 1,
      },
      deflections: wasDeflected
        ? {
            increment: 1,
          }
        : undefined,
      escalations: wasEscalated
        ? {
            increment: 1,
          }
        : undefined,
      costEstimate: {
        increment: cost,
      },
    },
  })
}

