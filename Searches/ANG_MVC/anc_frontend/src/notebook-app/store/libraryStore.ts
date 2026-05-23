import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  LibraryFilter,
  LibrarySort,
  LibraryView,
  NotebookListItem,
  NotebookWorkspace,
} from '@/notebook-app/types/notebook'

function uid() {
  return `nb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyWorkspace(title = 'Untitled notebook'): NotebookWorkspace {
  return {
    title,
    sources: [],
    messages: [],
    studioOutputs: [],
    notes: [],
    chatPhase: 'welcome',
    welcomeDismissed: false,
    welcomeModalOpen: true,
  }
}

interface LibraryState {
  notebooks: NotebookListItem[]
  workspaces: Record<string, NotebookWorkspace>
  filter: LibraryFilter
  view: LibraryView
  sort: LibrarySort
  searchQuery: string

  setFilter: (f: LibraryFilter) => void
  setView: (v: LibraryView) => void
  setSort: (s: LibrarySort) => void
  setSearchQuery: (q: string) => void
  createNotebook: () => string
  getWorkspace: (id: string) => NotebookWorkspace
  saveWorkspace: (id: string, workspace: NotebookWorkspace) => void
  deleteNotebook: (id: string) => void
}

export const useNotebookLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      notebooks: [],
      workspaces: {},
      filter: 'all',
      view: 'grid',
      sort: 'recent',
      searchQuery: '',

      setFilter: (filter) => set({ filter }),
      setView: (view) => set({ view }),
      setSort: (sort) => set({ sort }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      createNotebook: () => {
        const id = uid()
        const workspace = emptyWorkspace()
        const item: NotebookListItem = {
          id,
          title: workspace.title,
          updatedAt: new Date().toISOString(),
          sourceCount: 0,
        }
        set((s) => ({
          notebooks: [item, ...s.notebooks],
          workspaces: { ...s.workspaces, [id]: workspace },
        }))
        return id
      },

      getWorkspace: (id) => {
        const ws = get().workspaces[id]
        return ws ? { ...ws } : emptyWorkspace()
      },

      saveWorkspace: (id, workspace) => {
        set((s) => ({
          workspaces: { ...s.workspaces, [id]: workspace },
          notebooks: s.notebooks.map((n) =>
            n.id === id
              ? {
                  ...n,
                  title: workspace.title,
                  sourceCount: workspace.sources.length,
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        }))
      },

       deleteNotebook: (id) => {
         set((s) => {
           const workspaces = { ...s.workspaces }
           delete workspaces[id]
           return {
             workspaces,
             notebooks: s.notebooks.filter((n) => n.id !== id),
           }
         })
       },
    }),
    { name: 'anc-notebook-library' }
  )
)
