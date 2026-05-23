import { Icon } from '@/components/icons/Icon'

interface CreateNotebookCardProps {
  onClick: () => void
}

export function CreateNotebookCard({ onClick }: CreateNotebookCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-border-soft bg-surface hover:shadow-md transition-shadow"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-google-blue-bg text-google-blue">
        <Icon name="add" size={32} />
      </div>
      <p className="mt-3 text-sm text-text-muted">Create new notebook</p>
    </button>
  )
}
