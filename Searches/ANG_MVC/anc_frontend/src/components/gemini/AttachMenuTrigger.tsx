import { useRef, useState } from 'react'
import { GeminiAttachMenu } from '@/components/gemini/GeminiAttachMenu'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

export function AttachMenuTrigger() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'shrink-0 rounded-full p-3 transition-colors',
          open
            ? 'bg-sidebar text-text'
            : 'text-text-muted hover:bg-sidebar'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        title={open ? 'Close' : 'Add'}
      >
        <Icon name={open ? 'close' : 'add'} size={24} />
      </button>
      <GeminiAttachMenu
        anchorRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
