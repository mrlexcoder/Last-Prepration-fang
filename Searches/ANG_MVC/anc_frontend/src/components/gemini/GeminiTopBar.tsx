import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

interface GeminiTopBarProps {
  onNewChat: () => void
  showEdit?: boolean
}

export function GeminiTopBar({ onNewChat, showEdit = true }: GeminiTopBarProps) {
  return (
    <header className="absolute right-0 top-0 z-10 flex items-center gap-2 p-4">
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          'bg-google-blue-bg text-google-blue hover:bg-google-blue-hover'
        )}
      >
        <Icon name="auto_awesome" size={18} className="text-google-blue-soft" />
        Upgrade
      </button>
      {showEdit && (
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-full p-2.5 text-text-secondary hover:bg-sidebar transition-colors"
          title="New chat"
        >
          <Icon name="edit_square" size={22} />
        </button>
      )}
    </header>
  )
}
