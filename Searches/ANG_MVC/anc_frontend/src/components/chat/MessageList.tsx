import { useEffect, useRef } from 'react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import type { ThreadMessage } from '@/types/thread'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: ThreadMessage[]
  variant?: 'default' | 'gemini'
}

export function MessageList({ messages, variant = 'default' }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isGemini = variant === 'gemini'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className={cn(
        'flex flex-col',
        isGemini ? 'px-4 py-6 max-w-3xl mx-auto w-full' : 'gap-6 px-4 py-6'
      )}
    >
      {messages.length === 0 && !isGemini && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-text">Start a conversation</p>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            Ask anything. Thinking steps and streamed answers mirror Claude-style
            threads.
          </p>
        </div>
      )}
      <div className={cn(isGemini && 'space-y-8')}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} variant={variant} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
