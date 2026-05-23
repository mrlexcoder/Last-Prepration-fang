import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

export interface SettingsMenuItem {
  id: string
  icon: string
  label: string
  badge?: string
  hasSubmenu?: boolean
}

const MENU_ITEMS: SettingsMenuItem[] = [
  { id: 'activity', icon: 'history', label: 'Activity' },
  { id: 'personal', icon: 'auto_awesome', label: 'Personal Intelligence' },
  {
    id: 'import-memory',
    icon: 'download',
    label: 'Import memory to ANC',
    badge: 'New',
  },
  { id: 'usage', icon: 'data_usage', label: 'Usage limits' },
  { id: 'gems', icon: 'diamond', label: 'Gems' },
  { id: 'links', icon: 'link', label: 'Your public links' },
  { id: 'theme', icon: 'brightness_6', label: 'Theme', hasSubmenu: true },
  { id: 'subscriptions', icon: 'credit_card', label: 'View subscriptions' },
  { id: 'notebook', icon: 'menu_book', label: 'ANC Notebook (Library)' },
  { id: 'feedback', icon: 'feedback', label: 'Send feedback' },
  { id: 'help', icon: 'help', label: 'Help', hasSubmenu: true },
]

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: 'light_mode' },
  { id: 'dark', label: 'Dark', icon: 'dark_mode' },
  { id: 'system', label: 'System', icon: 'brightness_auto' },
] as const

interface GeminiSettingsMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

export function GeminiSettingsMenu({
  anchorRef,
  open,
  onClose,
}: GeminiSettingsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ bottom: 24, left: 24 })
  const [themeOpen, setThemeOpen] = useState(false)
  const navigate = useNavigate()
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  useEffect(() => {
    if (!open) return
    const anchorEl = anchorRef.current
    if (!anchorEl) return

    const updatePosition = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const menuWidth = 320
      let left = rect.left
      const bottom = window.innerHeight - rect.top + 8

      if (left + menuWidth > window.innerWidth - 16) {
        left = window.innerWidth - menuWidth - 16
      }
      if (left < 16) left = 16

      setPosition({ bottom, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

   useEffect(() => {
     if (!open) {
       // Use setTimeout to avoid synchronous setState in effect
       setTimeout(() => {
         setThemeOpen(false);
       }, 0);
       return;
     }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return
      }
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open, onClose, anchorRef])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            left: position.left,
            bottom: position.bottom,
            zIndex: 50,
          }}
          className="w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-xl shadow-black/10"
          role="menu"
        >
          <ul className="max-h-[min(70vh,480px)] overflow-y-auto py-2">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                {item.id === 'theme' ? (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => setThemeOpen((o) => !o)}
                      className="flex w-full items-center gap-4 px-5 py-3 text-left text-[15px] text-text hover:bg-sidebar transition-colors"
                    >
                      <Icon name={item.icon} size={22} className="text-text-secondary" />
                      <span className="flex-1">{item.label}</span>
                      <Icon
                        name={themeOpen ? 'expand_less' : 'chevron_right'}
                        size={22}
                        className="text-text-muted"
                      />
                    </button>
                    <AnimatePresence>
                      {themeOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border-soft/80 bg-surface-subtle"
                        >
                          {THEME_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setTheme(opt.id)
                                setThemeOpen(false)
                              }}
                              className={cn(
                                'flex w-full items-center gap-4 py-2.5 pl-14 pr-5 text-sm hover:bg-sidebar transition-colors',
                                theme === opt.id && 'text-google-blue font-medium'
                              )}
                            >
                              <Icon name={opt.icon} size={20} />
                              {opt.label}
                              {theme === opt.id && (
                                <Icon
                                  name="check"
                                  size={20}
                                  className="ml-auto text-google-blue"
                                />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      if (item.id === 'notebook') {
                        navigate('/notebook')
                        onClose()
                        return
                      }
                      if (!item.hasSubmenu) onClose()
                    }}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left text-[15px] text-text hover:bg-sidebar transition-colors"
                  >
                    <Icon name={item.icon} size={22} className="text-text-secondary" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-md bg-sidebar px-2 py-0.5 text-xs font-medium text-text-muted">
                        {item.badge}
                      </span>
                    )}
                    {item.hasSubmenu && (
                      <Icon name="chevron_right" size={22} className="text-text-muted" />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-border-soft px-5 py-4">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-google-blue" />
              <div>
                <p className="text-sm text-text">Anandpur Sahib, Punjab, India</p>
                <p className="mt-0.5 text-xs text-text-muted">From your IP address</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-google-blue hover:underline"
                >
                  Update location
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
