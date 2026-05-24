import type { CopilotSession } from '@/stores/copilotStore'

export interface ChatMessageLike {
  role: 'user' | 'assistant'
  content: string
}

export function buildConversationMemory(session?: Partial<CopilotSession>, messages: ChatMessageLike[] = []): string {
  const parts: string[] = []

  if (session?.summary) {
    parts.push(`Session summary: ${session.summary}`)
  }

  if (session?.intent) {
    parts.push(`Current intent: ${session.intent}`)
  }

  if (typeof session?.turnCount === 'number') {
    parts.push(`Turn count: ${session.turnCount}`)
  }

  const recent = messages
    .slice(-5)
    .map((message) => `${message.role}: ${message.content.trim().replace(/\s+/g, ' ')}`)
    .join('\n')

  if (recent) {
    parts.push(`Recent turns:\n${recent}`)
  }

  return parts.join('\n\n')
}

export function shouldResetCopilotSession(session?: Partial<CopilotSession>): boolean {
  if (!session?.updatedAt) return false
  return Date.now() - session.updatedAt > 45 * 60 * 1000
}
