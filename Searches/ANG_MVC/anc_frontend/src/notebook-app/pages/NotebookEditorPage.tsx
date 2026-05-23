import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { NotebookHeader } from '@/notebook-app/components/editor/NotebookHeader'
import { SourcesPanel } from '@/notebook-app/components/editor/SourcesPanel'
import { ChatPanel } from '@/notebook-app/components/editor/ChatPanel'
import { StudioPanel } from '@/notebook-app/components/editor/StudioPanel'
import { AddSourcesModal } from '@/notebook-app/components/editor/AddSourcesModal'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'
import { useNotebookLibraryStore } from '@/notebook-app/store/libraryStore'

export function NotebookEditorPage() {
  const { notebookId } = useParams<{ notebookId: string }>()
  const [sourcesOpen, setSourcesOpen] = useState(true)
  const [studioOpen, setStudioOpen] = useState(true)

  const loadWorkspace = useNotebookEditorStore((s) => s.loadWorkspace)
  const getSnapshot = useNotebookEditorStore((s) => s.getWorkspaceSnapshot)
  const getWorkspace = useNotebookLibraryStore((s) => s.getWorkspace)
  const saveWorkspace = useNotebookLibraryStore((s) => s.saveWorkspace)
  const workspaces = useNotebookLibraryStore((s) => s.workspaces)

  const exists = Boolean(notebookId && workspaces[notebookId])

  useEffect(() => {
    if (!notebookId || !workspaces[notebookId]) return
    loadWorkspace(getWorkspace(notebookId))
    // Initialize panels to open state when workspace loads
    // Using setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setSourcesOpen(true)
      setStudioOpen(true)
    }, 0)
  }, [notebookId, loadWorkspace, getWorkspace, workspaces])

  useEffect(() => {
    if (!notebookId || !exists) return
    const interval = setInterval(() => {
      saveWorkspace(notebookId, getSnapshot())
    }, 3000)
    return () => {
      clearInterval(interval)
      saveWorkspace(notebookId, getSnapshot())
    }
  }, [notebookId, exists, getSnapshot, saveWorkspace])

  if (!exists || !notebookId) {
    return <Navigate to="/notebook" replace />
  }

  const id = notebookId

  const gridMode =
    sourcesOpen && studioOpen
      ? 'three'
      : sourcesOpen
        ? 'sources-chat'
        : studioOpen
          ? 'chat-studio'
          : 'chat-only'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#e8eaed]">
      <NotebookHeader notebookId={id} />
      <AddSourcesModal />

      {/* Mobile: toggle hidden panels */}
      <div className="flex shrink-0 gap-2 border-b border-border-soft bg-surface px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSourcesOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm',
            sourcesOpen ? 'bg-google-blue-bg text-google-blue' : 'bg-sidebar text-text-secondary'
          )}
        >
          <Icon name="folder" size={18} />
          Sources
        </button>
        <button
          type="button"
          onClick={() => setStudioOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm',
            studioOpen ? 'bg-google-blue-bg text-google-blue' : 'bg-sidebar text-text-secondary'
          )}
        >
          <Icon name="auto_awesome" size={18} />
          Studio
        </button>
      </div>

      <div
        className={cn(
          'notebook-editor-grid flex-1 min-h-0',
          `notebook-editor-grid--${gridMode}`
        )}
      >
        {sourcesOpen && (
          <div className="notebook-col notebook-col-sources">
            <SourcesPanel onToggleCollapse={() => setSourcesOpen(false)} />
          </div>
        )}

        <div className="notebook-col notebook-col-chat">
          <ChatPanel />
        </div>

        {studioOpen && (
          <div className="notebook-col notebook-col-studio">
            <StudioPanel onToggleCollapse={() => setStudioOpen(false)} />
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-border-soft/50 bg-surface/90 py-2 text-center text-xs text-text-muted">
        ANC Notebook can be inaccurate; please double-check its responses.
      </footer>
    </div>
  )
}
