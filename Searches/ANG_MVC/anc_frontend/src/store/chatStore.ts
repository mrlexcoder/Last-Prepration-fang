import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import sampleData from '@/data/sample-threads.json'
import type { Thread, ThreadMessage } from '@/types/thread'
import { delay } from '@/lib/utils'
import { angApi } from '@/lib/angApi'
import type { RuntimeHint } from '@/lib/angApi'

interface ChatState {
  threads: Thread[]
  activeThreadId: string | null
  isGenerating: boolean
  runtimeHint: RuntimeHint
  mode: 'chat' | 'search' | 'loop' | 'pipeline' | 'tools' | 'infer' | 'web' | 'agentscope'
  loadSampleThreads: () => void
  setActiveThread: (id: string) => void
  createThread: (title?: string) => string
  sendMessage: (content: string) => Promise<void>
  toggleThinkingCollapsed: (messageId: string) => void
  setRuntimeHint: (hint: RuntimeHint) => void
  setMode: (mode: ChatState['mode']) => void
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      isGenerating: false,
      runtimeHint: 'runtime_adapter_hf',  // correct adapter id from registry.json
      mode: 'chat',

      loadSampleThreads: () => {
        const threads = sampleData.threads as Thread[]
        set({ threads, activeThreadId: null })
      },

      setActiveThread: (id) => set({ activeThreadId: id }),
      setRuntimeHint: (runtimeHint) => set({ runtimeHint }),
      setMode: (mode) => set({ mode }),

      createThread: (title = 'New conversation') => {
        const id = `thread-${uid()}`
        const thread: Thread = {
          id,
          title,
          module: 'chat',
          updatedAt: new Date().toISOString(),
          messages: [],
        }
        set((s) => ({
          threads: [...s.threads, thread],
          activeThreadId: id,
        }))
        return id
      },

      sendMessage: async (content) => {
        const state = get()
        if (state.isGenerating) return

        let activeThreadId = state.activeThreadId
        const { mode, runtimeHint } = state

        if (!activeThreadId) {
          activeThreadId = get().createThread(content.slice(0, 48))
        }

        const now = new Date().toISOString()

        const userMessage: ThreadMessage = {
          id: `msg-${uid()}`,
          role: 'user',
          content,
          createdAt: now,
          status: 'complete',
        }

        const assistantId = `msg-${uid()}`
        // Dynamic steps for AgentScope
        let initialSteps = [
          { id: '1', label: 'Routing to optimal brain', content: '', status: 'active' as const },
          { id: '2', label: 'Recalling long-term memory', content: '', status: 'pending' as const },
          { id: '3', label: 'Generating response', content: '', status: 'pending' as const },
        ]

        if (mode === 'agentscope') {
          initialSteps = [
            { id: 'planner', label: 'Planner', content: 'Breaking down the task...', status: 'active' as const },
            { id: 'executor', label: 'Executor', content: '', status: 'pending' as const },
            { id: 'critic', label: 'Critic', content: '', status: 'pending' as const },
            { id: 'synthesizer', label: 'Synthesizer', content: '', status: 'pending' as const },
          ]
        }

        const assistantMessage: ThreadMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: now,
          status: 'thinking',
          thinking: {
            visible: true,
            collapsed: false,
            steps: initialSteps,
          },
        }

        // IMPORTANT: Insert user question + assistant placeholder immediately
        // so the UI reflects the question and starts showing thinking steps
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  messages: [...t.messages, userMessage, assistantMessage],
                }
              : t
          ),
          isGenerating: true,
        }))

        let output = ''
        let confidence = 0
        let provider = ''
        let latencyMs = 0
        let sources: string[] = []
        let liveScrape = false
        let memoryUsed: string[] = []
        let contextSources = 0
        let agentSteps: any[] = []
        let res: any = {}

        try {
          const bridgeMode =
            mode === 'agentscope' ? 'agentscope' :
            (mode === 'web' || mode === 'search') ? mode : 'chat'

          res = await angApi.bridge({
            mode: bridgeMode,
            input: content,
            runtime_hint: runtimeHint,
          })

          output = res.output ?? res.final_output ?? JSON.stringify(res)
          confidence = res.confidence ?? 0
          provider = res.runtime ?? ''
          latencyMs = res.latency_ms ?? 0

          if (res.sources && res.sources.length > 0) {
            sources = res.sources.filter((s: string) => s.startsWith('http'))
          }
          liveScrape = res.live_scrape ?? false

          memoryUsed = res.memory_used || []
          contextSources = res.context_sources || 0

          // Build real AgentScope steps if available
          if (mode === 'agentscope' && res.reasoning_trace) {
            agentSteps = Object.entries(res.reasoning_trace).map(([agent, content], idx) => ({
              id: `agent-${idx}`,
              label: agent,
              content: String(content),
              status: 'done' as const,
            }))
          } else if (mode === 'agentscope' && res.agents_used) {
            agentSteps = res.agents_used.map((agent: string, idx: number) => ({
              id: `agent-${idx}`,
              label: agent,
              content: '',
              status: 'done' as const,
            }))
          }
        } catch (err) {
          output = `⚠️ Backend error: ${err instanceof Error ? err.message : String(err)}`
        }

        // Update thinking steps to done (with special handling for AgentScope)
        const isAgentScope = mode === 'agentscope' && (res.agents_used || res.reasoning_trace)

        // Safely find the assistant message we just inserted
        const currentThread = get().threads.find(t => t.id === activeThreadId)
        const assistantMsg = currentThread?.messages.find(m => m.id === assistantId)
        let finalSteps = assistantMsg?.thinking?.steps || []

        if (isAgentScope && res.reasoning_trace) {
          // Build real AgentScope steps from the response
          finalSteps = Object.keys(res.reasoning_trace).map((agentName, idx) => ({
            id: `agent-${idx}`,
            label: agentName,
            content: res.reasoning_trace[agentName] || '',
            status: 'done' as const,
          }))
        } else {
          finalSteps = (assistantMsg?.thinking?.steps || []).map((s) => ({ ...s, status: 'done' as const }))
        }

        // Update thinking panel once with final steps (AgentScope or normal)
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          thinking: m.thinking
                            ? { ...m.thinking, collapsed: false, steps: finalSteps }
                            : undefined,
                        }
                      : m
                  ),
                }
              : t
          ),
        }))

        // Single character-by-character streaming
        let built = ''
        for (const char of output) {
          built += char
          await delay(5)
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === activeThreadId
                ? {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            content: built,
                            confidence,
                            status: 'streaming',
                            meta: {
                              provider,
                              latencyMs,
                              sources,
                              liveScrape,
                              memoryUsed,
                              contextSources,
                              agentSteps,
                              cmu: res?.cmu,
                              multiCalc: res?.meta,
                            },
                          }
                        : m
                    ),
                  }
                : t
            ),
            isGenerating: true,
          }))
        }

        // Final commit - mark complete + attach full AGI metadata
        set((s) => ({
          isGenerating: false,
          threads: s.threads.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          status: 'complete' as const,
                          content: output,
                          sources,
                          liveScrape,
                          streamChunks: [
                            `conf:${(confidence * 100).toFixed(0)}% | ${provider}${latencyMs ? ` | ${Math.round(latencyMs)}ms` : ''}`,
                            memoryUsed.length > 0 ? `memory: ${memoryUsed.join(', ')}` : contextSources > 0 ? `context: ${contextSources} sources` : ''
                          ].filter(Boolean),
                          reasoningTrace: agentSteps.length > 0 ? agentSteps : null,
                          thinking: finalSteps.length > 0
                            ? { visible: true, collapsed: false, steps: finalSteps }
                            : m.thinking,
                          meta: {
                            provider,
                            latencyMs,
                            sources,
                            liveScrape,
                            memoryUsed,
                            contextSources,
                            agentSteps,
                            cmu: res?.cmu,
                            multiCalc: res?.meta,
                          },
                        }
                      : m
                  ),
                }
              : t
          ),
        }))
       },

      toggleThinkingCollapsed: (messageId) => {
        set((s) => ({
          threads: s.threads.map((t) => ({
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId && m.thinking
                ? {
                    ...m,
                    thinking: { ...m.thinking, collapsed: !m.thinking.collapsed },
                  }
                : m
            ),
          })),
        }))
      },
    }),
    {
      name: 'anc-chat-threads',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
)
