import { Link } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import type { NotebookListItem } from '@/notebook-app/types/notebook'

interface RecentNotebookCardProps {
  notebook: NotebookListItem
  onDelete?: (id: string) => void
}

export function RecentNotebookCard({ notebook, onDelete }: RecentNotebookCardProps) {
  return (
    <Link
      to={`/notebook/n/${notebook.id}`}
      className="group relative flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-border-soft bg-[#e8eaed] hover:shadow-md transition-shadow"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          onDelete?.(notebook.id)
        }}
        className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/80 transition-opacity"
        title="More"
      >
        <Icon name="more_vert" size={20} className="text-text-muted" />
      </button>
      <Icon name="folder" size={48} className="text-[#f9ab00]" />
      <p className="mt-3 px-3 text-center text-sm font-medium text-text truncate w-full">
        {notebook.title}
      </p>
    </Link>
  )
}
