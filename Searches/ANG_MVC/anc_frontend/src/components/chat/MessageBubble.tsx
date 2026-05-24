import { motion } from 'framer-motion'
import { ThinkingBlock } from '@/components/chat/ThinkingBlock'
import { AnswerRenderer } from '@/components/chat/AnswerRenderer'
import { SourceCards } from '@/components/chat/SourceCards'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'
import type { ThreadMessage } from '@/types/thread'

interface MessageBubbleProps {
  message: ThreadMessage
  variant?: 'default' | 'gemini'
}

export function MessageBubble({ message, variant = 'default' }: MessageBubbleProps) {
  const toggleThinking = useChatStore((s) => s.toggleThinkingCollapsed)
  const isUser = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isThinking = message.status === 'thinking'
  const isGemini = variant === 'gemini'

  if (isGemini && isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <p className="max-w-[85%] text-base text-text leading-relaxed">
          {message.content}
        </p>
      </motion.div>
    )
  }

  if (isGemini && !isUser) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base text-text leading-relaxed"
      >
        {message.thinking?.visible && (
          <ThinkingBlock
            thinking={message.thinking}
            onToggle={() => toggleThinking(message.id)}
            isActive={isThinking}
            variant="gemini"
          />
        )}
        <div className="max-w-none">
          {isThinking ? (
            <div className="flex items-center gap-2 text-text-muted py-1">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
              </div>
              <span className="text-xs font-medium">Thinking…</span>
            </div>
          ) : message.role === 'assistant' ? (
            <AnswerRenderer content={message.content} />
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content}
              {isStreaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse-soft bg-google-blue align-middle" />
              )}
            </div>
          )}
        </div>
        {message.status === 'complete' && message.sources && message.sources.length > 0 && (
          <SourceCards sources={message.sources} live={message.liveScrape} />
        )}
        {message.status === 'complete' && message.streamChunks?.[0] && (
          <p className="mt-2 text-xs text-text-muted">{message.streamChunks[0]}</p>
        )}
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          isUser ? 'bg-google-blue-bg text-google-blue' : 'bg-sidebar text-google-blue'
        )}
      >
        <Icon name={isUser ? 'person' : 'smart_toy'} size={20} />
      </div>
      <div className={cn('max-w-[85%] min-w-0', isUser && 'text-right')}>
        {!isUser && message.thinking?.visible && (
          <ThinkingBlock
            thinking={message.thinking}
            onToggle={() => toggleThinking(message.id)}
            isActive={isThinking}
          />
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-google-blue text-white inline-block text-left'
              : 'bg-sidebar border border-border-soft text-text'
          )}
        >
          {isThinking ? (
            // Nice waiting animation for slow responses
            <div className="flex items-center gap-2 text-text-muted">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
              </div>
              <span className="text-xs font-medium">Thinking…</span>
            </div>
          ) : (
            <>
              {message.content}
              {isStreaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse-soft bg-google-blue align-middle" />
              )}
            </>
          )}
        </div>
        {!isUser && message.status === 'complete' && message.sources && message.sources.length > 0 && (
          <SourceCards sources={message.sources} live={message.liveScrape} />
        )}
      </div>
    </motion.article>
  )
}
