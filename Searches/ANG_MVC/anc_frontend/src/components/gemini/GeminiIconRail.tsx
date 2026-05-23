import { Icon } from '@/components/icons/Icon'
import { GeminiLogo } from '@/components/gemini/GeminiLogo'
import { SettingsTrigger } from '@/components/gemini/SettingsTrigger'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

const railItems = [
  { icon: 'edit_square', label: 'New chat', action: 'newChat' as const },
  { icon: 'search', label: 'Search', action: 'search' as const },
  { icon: 'history', label: 'History', action: 'history' as const },
]

interface GeminiIconRailProps {
  onNewChat: () => void
}

export function GeminiIconRail({ onNewChat }: GeminiIconRailProps) {
  const user = useAuthStore((s) => s.user)
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

  if (sidebarExpanded) return null

  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-border-soft bg-sidebar py-3">
      <button
        type="button"
        onClick={toggleSidebar}
        className="mb-4 rounded-full p-2 hover:bg-google-blue-hover transition-colors"
        title="Expand menu"
      >
        <GeminiLogo showText={false} size="sm" />
      </button>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {railItems.map((item) => (
          <button
            key={item.icon}
            type="button"
            title={item.label}
            onClick={() => {
              if (item.action === 'newChat') onNewChat()
              if (item.action === 'search') setSearchOpen(true)
              if (item.action === 'history') toggleSidebar()
            }}
            className="rounded-full p-3 text-text-secondary hover:bg-google-blue-hover hover:text-google-blue transition-colors"
          >
            <Icon name={item.icon} size={24} />
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <SettingsTrigger className="p-3 text-text-secondary hover:bg-google-blue-hover hover:text-google-blue">
          <Icon name="settings" size={24} />
        </SettingsTrigger>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-google-blue-bg text-sm font-semibold text-google-blue"
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </aside>
  )
}
