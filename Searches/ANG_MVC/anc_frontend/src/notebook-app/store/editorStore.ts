import { create } from 'zustand'
import type {
  ChatPhase,
  NotebookMessage,
  NotebookSource,
  NotebookWorkspace,
  ResearchStatus,
  StudioOutput,
} from '@/notebook-app/types/notebook'
import { delay } from '@/lib/utils'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface NotebookState {
  title: string
  sources: NotebookSource[]
  messages: NotebookMessage[]
  studioOutputs: StudioOutput[]
  notes: { id: string; content: string }[]
  chatPhase: ChatPhase
  welcomeDismissed: boolean
  addSourcesOpen: boolean
  welcomeModalOpen: boolean
  sourcesCollapsed: boolean
  studioCollapsed: boolean
  researchStatus: ResearchStatus
  sourceSearchQuery: string
  researchMode: 'web' | 'fast'
  isGenerating: boolean

  setTitle: (t: string) => void
  setAddSourcesOpen: (v: boolean) => void
  setWelcomeModalOpen: (v: boolean) => void
  dismissWelcome: () => void
  toggleSourcesCollapsed: () => void
  toggleStudioCollapsed: () => void
  setSourceSearchQuery: (q: string) => void
  setResearchMode: (m: 'web' | 'fast') => void
  addSource: (title: string, type: NotebookSource['type']) => void
  runSourceSearch: () => Promise<void>
  selectSuggestion: (label: string) => void
  sendChatMessage: (content: string) => Promise<void>
  saveMessageToNote: (messageId: string) => void
  addNote: (content: string) => void
  createStudioOutput: (type: string, title: string) => void
  loadWorkspace: (workspace: NotebookWorkspace) => void
  getWorkspaceSnapshot: () => NotebookWorkspace
}

const DEMO_REPLY = `Here is a structured overview based on your notebook context:

**Key points**
- Organize sources before generating studio outputs
- Use chat to summarize, compare, or extract data from uploads
- Studio tools create Audio Overview, slides, mind maps, and more

**Next steps**
1. Add PDFs or websites in **Sources**
2. Ask follow-up questions in **Chat**
3. Pick a **Studio** format to generate shareable output`

export const useNotebookEditorStore = create<NotebookState>((set, get) => ({
  title: 'ANC notebook',
  sources: [],
  messages: [],
  studioOutputs: [],
  notes: [],
  chatPhase: 'welcome',
  welcomeDismissed: false,
  addSourcesOpen: false,
  welcomeModalOpen: true,
  sourcesCollapsed: false,
  studioCollapsed: false,
  researchStatus: 'idle',
  sourceSearchQuery: '',
  researchMode: 'fast',
  isGenerating: false,

  setTitle: (title) => set({ title }),
  setAddSourcesOpen: (addSourcesOpen) => set({ addSourcesOpen }),
  setWelcomeModalOpen: (welcomeModalOpen) => set({ welcomeModalOpen }),
  dismissWelcome: () =>
    set({ welcomeDismissed: true, welcomeModalOpen: false }),
  toggleSourcesCollapsed: () =>
    set((s) => ({ sourcesCollapsed: !s.sourcesCollapsed })),
  toggleStudioCollapsed: () =>
    set((s) => ({ studioCollapsed: !s.studioCollapsed })),
  setSourceSearchQuery: (sourceSearchQuery) => set({ sourceSearchQuery }),
  setResearchMode: (researchMode) => set({ researchMode }),

  addSource: (title, type) => {
    const source: NotebookSource = {
      id: `src-${uid()}`,
      title,
      type,
      addedAt: new Date().toISOString(),
    }
    set((s) => ({
      sources: [...s.sources, source],
      addSourcesOpen: false,
      researchStatus: 'idle',
    }))
  },

  runSourceSearch: async () => {
    const { sourceSearchQuery } = get()
    if (!sourceSearchQuery.trim()) return
    set({ researchStatus: 'searching' })
    await delay(2200)
    get().addSource(
      `Web: ${sourceSearchQuery.trim().slice(0, 40)}`,
      'website'
    )
    set({ sourceSearchQuery: '', researchStatus: 'done' })
    await delay(500)
    set({ researchStatus: 'idle' })
  },

  selectSuggestion: (label) => {
    set({ chatPhase: 'chat', welcomeDismissed: true, welcomeModalOpen: false })
    void get().sendChatMessage(
      label === 'Something else...'
        ? 'Help me define what this notebook should do.'
        : label
    )
  },

  sendChatMessage: async (content) => {
    const { isGenerating } = get()
    if (isGenerating || !content.trim()) return

    const userMsg: NotebookMessage = {
      id: `msg-${uid()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }

    set((s) => ({
      chatPhase: 'chat',
      welcomeDismissed: true,
      welcomeModalOpen: false,
      isGenerating: true,
      messages: [...s.messages, userMsg],
    }))

    await delay(1200)

    const assistantMsg: NotebookMessage = {
      id: `msg-${uid()}`,
      role: 'assistant',
      content: DEMO_REPLY,
      createdAt: new Date().toISOString(),
    }

    set((s) => ({
      isGenerating: false,
      messages: [...s.messages, assistantMsg],
    }))
  },

  saveMessageToNote: (messageId) => {
    const msg = get().messages.find((m) => m.id === messageId)
    if (!msg) return
    set((s) => ({
      notes: [
        ...s.notes,
        { id: `note-${uid()}`, content: msg.content.slice(0, 500) },
      ],
    }))
  },

  addNote: (content) => {
    set((s) => ({
      notes: [...s.notes, { id: `note-${uid()}`, content }],
    }))
  },

  createStudioOutput: (type, title) => {
    set((s) => ({
      studioOutputs: [
        {
          id: `out-${uid()}`,
          type,
          title,
          createdAt: new Date().toISOString(),
        },
        ...s.studioOutputs,
      ],
    }))
  },

  loadWorkspace: (workspace) =>
    set({
      title: workspace.title,
      sources: workspace.sources,
      messages: workspace.messages,
      studioOutputs: workspace.studioOutputs,
      notes: workspace.notes,
      chatPhase: workspace.chatPhase,
      welcomeDismissed: workspace.welcomeDismissed,
      welcomeModalOpen: workspace.welcomeModalOpen,
      addSourcesOpen: false,
      sourcesCollapsed: false,
      studioCollapsed: false,
      researchStatus: 'idle',
      sourceSearchQuery: '',
      researchMode: 'fast',
      isGenerating: false,
    }),

  getWorkspaceSnapshot: () => {
    const s = get()
    return {
      title: s.title,
      sources: s.sources,
      messages: s.messages,
      studioOutputs: s.studioOutputs,
      notes: s.notes,
      chatPhase: s.chatPhase,
      welcomeDismissed: s.welcomeDismissed,
      welcomeModalOpen: s.welcomeModalOpen,
    }
  },
}))
