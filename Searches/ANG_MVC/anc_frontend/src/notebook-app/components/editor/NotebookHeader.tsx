import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { SettingsTrigger } from '@/components/gemini/SettingsTrigger'
import { useAuthStore } from '@/store/authStore'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'
import { useNotebookLibraryStore } from '@/notebook-app/store/libraryStore'

interface NotebookHeaderProps {
  notebookId: string
}

export function NotebookHeader({ notebookId }: NotebookHeaderProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const title = useNotebookEditorStore((s) => s.title)
  const setTitle = useNotebookEditorStore((s) => s.setTitle)
  const getSnapshot = useNotebookEditorStore((s) => s.getWorkspaceSnapshot)
  const saveWorkspace = useNotebookLibraryStore((s) => s.saveWorkspace)
  const createNotebook = useNotebookLibraryStore((s) => s.createNotebook)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U'

  const handleTitleChange = (value: string) => {
    setTitle(value)
    saveWorkspace(notebookId, { ...getSnapshot(), title: value })
  }

  const handleCreateNotebook = () => {
    saveWorkspace(notebookId, getSnapshot())
    const id = createNotebook()
    navigate(`/notebook/n/${id}`)
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-soft bg-surface px-4">
      <Link
        to="/notebook"
        className="flex items-center gap-2 rounded-full p-2 text-text-muted hover:bg-sidebar transition-colors"
        title="Notebook home"
      >
        <Icon name="arrow_back" size={22} />
      </Link>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f1f1f] text-white">
          <Icon name="menu_book" size={18} />
        </div>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="min-w-0 max-w-[280px] truncate bg-transparent text-base font-medium text-text focus:outline-none focus:underline"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleCreateNotebook}
          className="flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          <Icon name="add" size={20} />
          Create notebook
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm text-text hover:bg-sidebar transition-colors"
        >
          <Icon name="share" size={18} />
          Share
        </button>
        <SettingsTrigger className="p-2 hover:bg-sidebar" showBadge={false}>
          <Icon name="settings" size={22} className="text-text-secondary" />
        </SettingsTrigger>
        <Link
          to="/app"
          className="rounded-full p-2 text-text-muted hover:bg-sidebar transition-colors"
          title="ANC AI Chat"
        >
          <Icon name="chat" size={22} />
        </Link>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-google-blue-bg text-sm font-semibold text-google-blue"
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
