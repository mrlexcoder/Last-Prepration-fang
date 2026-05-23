import { useRef, useState, type ReactNode } from 'react'
import { GeminiSettingsMenu } from '@/components/gemini/GeminiSettingsMenu'
import { cn } from '@/lib/utils'

interface SettingsTriggerProps {
  children: ReactNode
  className?: string
  showBadge?: boolean
}

export function SettingsTrigger({
  children,
  className,
  showBadge = true,
}: SettingsTriggerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative rounded-full transition-colors',
          open && 'bg-google-blue-hover',
          className
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Settings"
      >
        {children}
        {showBadge && !open && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-google-blue" />
        )}
      </button>
      <GeminiSettingsMenu
        anchorRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
