import { Link } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { SettingsTrigger } from '@/components/gemini/SettingsTrigger'
import { useAuthStore } from '@/store/authStore'

export function NotebookHomeHeader() {
  const user = useAuthStore((s) => s.user)
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-soft bg-surface px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1f1f] text-white">
          <Icon name="menu_book" size={20} />
        </div>
        <span className="text-xl font-normal text-text tracking-tight">
          ANC Notebook
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/app"
          className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-sm text-text-secondary hover:bg-sidebar transition-colors"
        >
          <Icon name="auto_awesome" size={18} className="text-google-blue" />
          ANC AI
        </Link>
        <SettingsTrigger className="p-2 hover:bg-sidebar" showBadge={false}>
          <Icon name="settings" size={22} className="text-text-secondary" />
        </SettingsTrigger>
        <button
          type="button"
          className="rounded-full p-2 text-text-muted hover:bg-sidebar transition-colors"
          title="Apps"
        >
          <Icon name="apps" size={22} />
        </button>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-google-blue-bg text-sm font-semibold text-google-blue"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
