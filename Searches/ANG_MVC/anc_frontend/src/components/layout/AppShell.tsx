import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface-elevated/90 px-4 backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="text-google-blue">A</span>
          <span>NC</span>
        </Link>
        {title && (
          <>
            <span className="text-text-muted">/</span>
            <span className="text-sm text-text-muted">{title}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-text-muted sm:inline">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <Icon name="logout" size={20} />
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col min-h-0">{children}</main>
    </div>
  )
}
