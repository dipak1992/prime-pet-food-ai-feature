'use client'
import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

export type CopilotState = 'collapsed' | 'peek' | 'expanded'
export type CopilotScreen = 'tonight' | 'cook' | 'plan' | 'leftovers' | 'budget' | 'grocery' | 'home'
export type CopilotNudgeStatus = 'active' | 'accepted' | 'dismissed'

export interface CopilotChip {
  id: string
  label: string
  icon?: string // emoji
  action: CopilotChipAction
}

export type CopilotChipAction =
  | { type: 'navigate'; href: string }
  | { type: 'trigger'; feature: string; params?: Record<string, unknown> }
  | { type: 'message'; text: string } // for Phase 2

// ── Phase 2: Message types ────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  action?: CopilotChipAction // If the response triggers an action
}

export interface CopilotNudge {
  id: string
  type: string
  title: string
  body: string
  ctaLabel: string
  priority: number
  action: CopilotChipAction
  expiresAt?: string | null
  variant?: string
  status?: CopilotNudgeStatus
}

export interface CopilotSession {
  id: string
  startedAt: number
  updatedAt: number
  turnCount: number
  summary: string
  intent?: string
}

// ── Store interface ───────────────────────────────────────────────────────────

interface CopilotStore {
  // Phase 1
  state: CopilotState
  screen: CopilotScreen
  chips: CopilotChip[]
  activeNudge: CopilotNudge | null
  // Phase 2
  messages: CopilotMessage[]
  isStreaming: boolean
  // Phase 4
  session: CopilotSession
  // Actions — Phase 1
  open: () => void
  peek: () => void
  close: () => void
  setScreen: (screen: CopilotScreen) => void
  setChips: (chips: CopilotChip[]) => void
  setActiveNudge: (nudge: CopilotNudge | null) => void
  acceptNudge: () => Promise<void>
  dismissNudge: () => Promise<void>
  // Actions — Phase 2
  addMessage: (msg: Omit<CopilotMessage, 'id' | 'timestamp'>) => void
  setStreaming: (v: boolean) => void
  clearMessages: () => void
  sendMessage: (text: string, screen: string) => Promise<void>
  startNewSession: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function makeSession(): CopilotSession {
  const now = Date.now()
  return {
    id: `copilot-${now}-${Math.random().toString(36).slice(2, 8)}`,
    startedAt: now,
    updatedAt: now,
    turnCount: 0,
    summary: '',
  }
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function inferIntent(text: string): string | undefined {
  const lower = text.toLowerCase()
  if (/(swap|replace|change).*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/.test(lower)) return 'plan_refinement'
  if (/(grocery|shopping|add .*list|buy)/.test(lower)) return 'grocery'
  if (/(leftover|expire|freez)/.test(lower)) return 'leftovers'
  if (/(budget|cheap|cost|under \$|save)/.test(lower)) return 'budget'
  if (/(dinner|tonight|cook|meal)/.test(lower)) return 'tonight'
  return undefined
}

function compactSummary(messages: CopilotMessage[], currentSummary: string): string {
  const recent = messages.slice(-6)
  const facts = recent
    .filter((m) => m.content.trim())
    .map((m) => `${m.role}: ${m.content.trim().replace(/\s+/g, ' ')}`)
    .join(' | ')

  const combined = [currentSummary, facts].filter(Boolean).join(' | ')
  return combined.length <= 900 ? combined : combined.slice(combined.length - 900)
}

async function trackNudge(nudge: CopilotNudge, event: 'accepted' | 'dismissed') {
  await fetch('/api/copilot/nudges', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nudgeId: nudge.id, event }),
  }).catch(() => undefined)
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCopilotStore = create<CopilotStore>()(
  persist(
    (set, get) => ({
      // Phase 1 state
      state: 'collapsed',
      screen: 'home',
      chips: [],
      activeNudge: null,
      // Phase 2 state
      messages: [],
      isStreaming: false,
      // Phase 4 state
      session: makeSession(),

      // Phase 1 actions
      open: () => set({ state: 'expanded' }),
      peek: () => set({ state: 'peek' }),
      close: () => set({ state: 'collapsed' }),
      setScreen: (screen) => set({ screen }),
      setChips: (chips) => set({ chips }),
      setActiveNudge: (nudge) => set({ activeNudge: nudge }),
      acceptNudge: async () => {
        const nudge = get().activeNudge
        if (!nudge) return
        set({ activeNudge: { ...nudge, status: 'accepted' } })
        await trackNudge(nudge, 'accepted')
      },
      dismissNudge: async () => {
        const nudge = get().activeNudge
        if (!nudge) return
        set({ activeNudge: null })
        await trackNudge(nudge, 'dismissed')
      },

      // Phase 2 actions
      addMessage: (msg) => {
        const message: CopilotMessage = {
          ...msg,
          id: generateId(),
          timestamp: Date.now(),
        }
        set((s) => ({ messages: [...s.messages, message] }))
      },

      setStreaming: (v) => set({ isStreaming: v }),

      clearMessages: () => set({ messages: [], session: makeSession() }),

      startNewSession: () => set({ messages: [], session: makeSession() }),

      sendMessage: async (text: string, screen: string) => {
        const { messages, addMessage, setStreaming, session } = get()

    // 1. Add user message
    addMessage({ role: 'user', content: text })
    setStreaming(true)

    // 2. Prepare conversation history for API
    const history = [
      ...messages,
      { id: generateId(), role: 'user' as const, content: text, timestamp: Date.now() },
    ].map((m) => ({ role: m.role, content: m.content }))

    // 3. Create a placeholder assistant message id for streaming
    const assistantId = generateId()
    let assistantContent = ''

    // Add empty assistant message to stream into
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: assistantId,
          role: 'assistant' as const,
          content: '',
          timestamp: Date.now(),
        },
      ],
    }))

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, screen, session }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' })) as {
          error?: string
          action?: { type: string; payload?: unknown }
        }
        let chipAction: CopilotChipAction | undefined
        if (err.action?.type === 'navigate') {
          const payload = err.action.payload as { href?: string } | undefined
          chipAction = { type: 'navigate', href: payload?.href ?? '/upgrade?feature=copilot' }
        }
        // Update assistant message with error
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: err.error || 'Something went wrong. Please try again.', action: chipAction }
              : m,
          ),
        }))
        return
      }

      // 4. Read the SSE stream
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr) as {
              type: 'text' | 'action' | 'done' | 'error'
              content?: string
              action?: { type: string; payload: unknown }
              message?: string
            }

            if (event.type === 'text' && event.content) {
              assistantContent += event.content
              // Update the streaming assistant message
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m,
                ),
              }))
            } else if (event.type === 'action' && event.action) {
              // Attach action to the assistant message
              const action = event.action
              let chipAction: CopilotChipAction | undefined

              if (action.type === 'navigate') {
                const payload = action.payload as { href: string }
                chipAction = { type: 'navigate', href: payload.href }
              } else if (action.type === 'trigger') {
                const payload = action.payload as { feature: string; params?: Record<string, unknown> }
                chipAction = { type: 'trigger', feature: payload.feature, params: payload.params }
              }

              if (chipAction) {
                set((s) => ({
                  messages: s.messages.map((m) =>
                    m.id === assistantId ? { ...m, action: chipAction } : m,
                  ),
                }))
              }
            } else if (event.type === 'error') {
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: event.message || 'Something went wrong.' }
                    : m,
                ),
              }))
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    } catch {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Connection error. Please check your internet and try again.' }
            : m,
        ),
      }))
    } finally {
      const nextMessages = get().messages
      set((s) => ({
        isStreaming: false,
        session: {
          ...s.session,
          updatedAt: Date.now(),
          turnCount: Math.min(99, s.session.turnCount + 1),
          intent: s.session.intent ?? inferIntent(text),
          summary: compactSummary(nextMessages, s.session.summary),
        },
      }))
    }
      },
    }),
    {
      name: 'nutrinest-copilot-session',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : sessionStorage)),
      partialize: (state) => ({
        messages: state.messages.slice(-12),
        session: state.session,
        activeNudge: state.activeNudge,
      }),
    },
  ),
)
