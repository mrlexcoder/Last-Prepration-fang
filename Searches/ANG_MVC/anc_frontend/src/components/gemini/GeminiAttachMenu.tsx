import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

type SubmenuId = 'more-uploads' | 'more-tools'

interface MenuItem {
  id: string
  icon: string
  label: string
  badge?: string
  submenu?: SubmenuId
}

const UPLOAD_ITEMS: MenuItem[] = [
  { id: 'photos', icon: 'photo_library', label: 'Photos' },
  { id: 'camera', icon: 'photo_camera', label: 'Camera' },
  { id: 'clipboard', icon: 'content_paste', label: 'Clipboard' },
]

const PRIMARY_ITEMS: MenuItem[] = [
  { id: 'upload-files', icon: 'attach_file', label: 'Upload files' },
  { id: 'add-drive', icon: 'add_to_drive', label: 'Add from Drive' },
  { id: 'more-uploads', icon: 'more_horiz', label: 'More uploads', submenu: 'more-uploads' },
]

const TOOL_ITEMS: MenuItem[] = [
  { id: 'create-image', icon: 'palette', label: 'Create image', badge: 'New' },
  { id: 'canvas', icon: 'note_stack', label: 'Canvas' },
  { id: 'more-tools', icon: 'more_horiz', label: 'More tools', submenu: 'more-tools' },
]

const MORE_TOOLS_ITEMS: MenuItem[] = [
  { id: 'deep-research', icon: 'science', label: 'Deep Research' },
  { id: 'create-music', icon: 'music_note', label: 'Create music', badge: 'New' },
  { id: 'guided-learning', icon: 'menu_book', label: 'Guided Learning' },
  { id: 'personal-intel', icon: 'person_add', label: 'Personal Intelligence' },
]

interface GeminiAttachMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

function MenuRow({
  item,
  active,
  onEnter,
  onClick,
}: {
  item: MenuItem
  active?: boolean
  onEnter: () => void
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseEnter={onEnter}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-text transition-colors',
        active ? 'bg-sidebar' : 'hover:bg-sidebar'
      )}
    >
      <Icon name={item.icon} size={22} className="text-text-secondary shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-md bg-sidebar px-2 py-0.5 text-xs font-medium text-text-muted">
          {item.badge}
        </span>
      )}
      {item.submenu && (
        <Icon name="chevron_right" size={22} className="text-text-muted shrink-0" />
      )}
    </button>
  )
}

function SubmenuPanel({
  items,
  showPersonalToggle,
}: {
  items: MenuItem[]
  showPersonalToggle?: boolean
}) {
  const personalOn = useUiStore((s) => s.personalIntelligenceEnabled)
  const setPersonalOn = useUiStore((s) => s.setPersonalIntelligenceEnabled)

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.15 }}
      className="min-w-[240px] rounded-2xl border border-border-soft bg-surface py-2 shadow-xl shadow-black/10"
    >
      {items.map((item) =>
        item.id === 'personal-intel' && showPersonalToggle ? (
          <div
            key={item.id}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-[15px] text-text"
          >
            <Icon name={item.icon} size={22} className="text-text-secondary shrink-0" />
            <span className="flex-1">{item.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={personalOn}
              onClick={() => setPersonalOn(!personalOn)}
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                personalOn ? 'bg-google-blue' : 'bg-border-soft'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  personalOn && 'translate-x-5'
                )}
              />
            </button>
          </div>
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-text hover:bg-sidebar transition-colors"
          >
            <Icon name={item.icon} size={22} className="text-text-secondary shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded-md bg-sidebar px-2 py-0.5 text-xs font-medium text-text-muted">
                {item.badge}
              </span>
            )}
          </button>
        )
      )}
    </motion.div>
  )
}

export function GeminiAttachMenu({
  anchorRef,
  open,
  onClose,
}: GeminiAttachMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ bottom: 100, left: 100 })
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId | null>(null)

    // Reset active submenu when menu closes
    useEffect(() => {
      if (!open) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setActiveSubmenu(null);
        }, 0);
      }
    }, [open]);

   // Update position when open or anchor changes
   useEffect(() => {
     if (!open) return;
     const anchorEl = anchorRef.current;
     if (!anchorEl) return;

     const updatePosition = () => {
       const el = anchorRef.current;
       if (!el) return;
       const rect = el.getBoundingClientRect();
       const menuWidth = activeSubmenu ? 480 : 260;
       let left = rect.left;
       const bottom = window.innerHeight - rect.top + 12;

       if (left + menuWidth > window.innerWidth - 16) {
         left = Math.max(16, window.innerWidth - menuWidth - 16);
       }

       setPosition({ bottom, left });
     };

     updatePosition();
     window.addEventListener('resize', updatePosition);
     window.addEventListener('scroll', updatePosition, true);
     return () => {
       window.removeEventListener('resize', updatePosition);
       window.removeEventListener('scroll', updatePosition, true);
     };
   }, [open, anchorRef, activeSubmenu]);

  useEffect(() => {
    if (!open) return
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

  const submenuItems =
    activeSubmenu === 'more-uploads' ? UPLOAD_ITEMS : MORE_TOOLS_ITEMS

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
          className="flex items-start gap-1"
          role="menu"
        >
          <div className="w-[260px] overflow-hidden rounded-2xl border border-border-soft bg-surface py-2 shadow-xl shadow-black/10">
            {PRIMARY_ITEMS.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                active={activeSubmenu === item.submenu}
                onEnter={() => item.submenu && setActiveSubmenu(item.submenu)}
                onClick={() => {
                  if (item.submenu) {
                    setActiveSubmenu(item.submenu)
                  } else {
                    onClose()
                  }
                }}
              />
            ))}

            <div className="my-2 border-t border-border-soft" />

            {TOOL_ITEMS.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                active={activeSubmenu === item.submenu}
                onEnter={() => item.submenu && setActiveSubmenu(item.submenu)}
                onClick={() => {
                  if (item.submenu) {
                    setActiveSubmenu(item.submenu)
                  } else {
                    onClose()
                  }
                }}
              />
            ))}
          </div>

          <AnimatePresence>
            {activeSubmenu && (
              <SubmenuPanel
                items={submenuItems}
                showPersonalToggle={activeSubmenu === 'more-tools'}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
