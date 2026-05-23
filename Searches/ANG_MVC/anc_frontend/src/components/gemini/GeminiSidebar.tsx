import { Link } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { GeminiLogo } from '@/components/gemini/GeminiLogo'
import { SettingsTrigger } from '@/components/gemini/SettingsTrigger'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useUiStore } from '@/store/uiStore'

interface GeminiSidebarProps {
  onNewChat: () => void
}

export function GeminiSidebar({ onNewChat }: GeminiSidebarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const threads = useChatStore((s) => s.threads)
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const setActiveThread = useChatStore((s) => s.setActiveThread)
  const sidebarExpanded = useUiStore((s) => s.sidebarExpanded)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U'

  if (!sidebarExpanded) return null

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-border-soft bg-sidebar">
      <div className="flex items-center justify-between px-4 py-4">
        <GeminiLogo />
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-full p-2 text-text-muted hover:bg-google-blue-hover transition-colors"
          title="Collapse"
        >
          <Icon name="menu_open" size={22} />
        </button>
      </div>

      <div className="px-3 space-y-1">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-3 rounded-full bg-google-blue-bg px-4 py-3 text-sm font-medium text-text hover:bg-google-blue-hover transition-colors"
        >
          <Icon name="edit_square" size={20} />
          New chat
        </button>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm text-text-secondary hover:bg-white/80 transition-colors"
        >
          <Icon name="search" size={20} />
          Search chats
        </button>
        <Link
          to="/notebook"
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm text-text-secondary hover:bg-white/80 transition-colors"
        >
          <Icon name="book_2" size={20} />
          ANC Notebook
        </Link>
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm text-text-secondary hover:bg-white/80 transition-colors"
          >
            <Icon name="admin_panel_settings" size={20} />
            Admin Panel
          </Link>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between px-4">
        <span className="text-xs font-medium text-text-muted">Notebooks</span>
        <Link
          to="/notebook"
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-google-blue"
        >
          <Icon name="add" size={16} />
          New notebook
        </Link>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-2">
        <p className="px-2 py-2 text-xs text-text-muted">Recent</p>
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveThread(t.id)}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm truncate transition-colors',
              t.id === activeThreadId
                ? 'bg-white text-text font-medium shadow-sm'
                : 'text-text-secondary hover:bg-white/70'
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="border-t border-border-soft p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-google-blue-bg text-sm font-semibold text-google-blue">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <SettingsTrigger className="p-2 hover:bg-google-blue-hover" showBadge={false}>
            <Icon name="settings" size={20} className="text-text-muted" />
          </SettingsTrigger>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-text-muted hover:bg-white/80 hover:text-text"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
