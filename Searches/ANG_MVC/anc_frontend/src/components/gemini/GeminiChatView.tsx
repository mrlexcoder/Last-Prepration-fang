import { MessageList } from '@/components/chat/MessageList'
import { GeminiPromptBar } from '@/components/gemini/GeminiPromptBar'
import type { ThreadMessage } from '@/types/thread'

interface GeminiChatViewProps {
  messages: ThreadMessage[]
}

export function GeminiChatView({ messages }: GeminiChatViewProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessageList messages={messages} variant="gemini" />
      </div>
      <GeminiPromptBar />
    </div>
  )
}
