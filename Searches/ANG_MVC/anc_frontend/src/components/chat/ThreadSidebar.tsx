import { motion } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'
import type { Thread } from '@/types/thread'

const moduleIcons: Record<Thread['module'], string> = {
  chat: 'forum',
  code: 'code',
  docs: 'description',
  analysis: 'analytics',
}

interface ThreadSidebarProps {
  collapsed?: boolean
}

export function ThreadSidebar({ collapsed }: ThreadSidebarProps) {
  const threads = useChatStore((s) => s.threads)
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const setActiveThread = useChatStore((s) => s.setActiveThread)
  const createThread = useChatStore((s) => s.createThread)

  if (collapsed) {
    return (
      <div className="flex w-14 flex-col items-center gap-2 border-r border-border py-4">
        <Button variant="ghost" size="sm" onClick={() => createThread()} title="New thread">
          <Icon name="add" size={22} />
        </Button>
      </div>
    )
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface-elevated">
      <div className="border-b border-border p-3">
        <Button
          variant="outline"
          className="w-full border-google-blue/30 hover:border-google-blue/60"
          onClick={() => createThread()}
        >
          <Icon name="add" size={20} className="text-google-blue" />
          New thread
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Threads
        </p>
        {threads.map((t) => {
          const preview =
            t.messages.find((m) => m.role === 'user')?.content ??
            t.messages[0]?.content ??
            'Empty thread'
          const active = t.id === activeThreadId
          return (
            <motion.button
              key={t.id}
              type="button"
              whileHover={{ x: 2 }}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                'mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                active
                  ? 'bg-google-blue/15 border border-google-blue/30'
                  : 'hover:bg-white/5 border border-transparent'
              )}
            >
              <div className="flex items-start gap-2">
                <Icon
                  name={moduleIcons[t.module]}
                  size={18}
                  className={cn(
                    'mt-0.5 shrink-0',
                    active ? 'text-google-blue' : 'text-text-muted'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-xs text-text-muted">{preview}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </aside>
  )
}
