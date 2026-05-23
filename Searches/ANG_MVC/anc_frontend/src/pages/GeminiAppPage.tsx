import { GeminiIconRail } from '@/components/gemini/GeminiIconRail'
import { GeminiSidebar } from '@/components/gemini/GeminiSidebar'
import { GeminiTopBar } from '@/components/gemini/GeminiTopBar'
import { GeminiHome } from '@/components/gemini/GeminiHome'
import { GeminiChatView } from '@/components/gemini/GeminiChatView'
import { useChatStore } from '@/store/chatStore'

export function GeminiAppPage() {
  const threads = useChatStore((s) => s.threads)
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const createThread = useChatStore((s) => s.createThread)
  const activeThread = threads.find((t) => t.id === activeThreadId)

  const hasMessages = (activeThread?.messages.length ?? 0) > 0

  const handleNewChat = () => {
    createThread()
  }

  return (
    <div className="flex h-full min-h-screen bg-surface">
      <GeminiIconRail onNewChat={handleNewChat} />
      <GeminiSidebar onNewChat={handleNewChat} />

      <div className="relative flex flex-1 flex-col min-w-0 gemini-glow">
        <GeminiTopBar onNewChat={handleNewChat} />

        <main className="flex flex-1 flex-col min-h-0 pt-14">
          {hasMessages ? (
            <GeminiChatView messages={activeThread?.messages ?? []} />
          ) : (
            <GeminiHome />
          )}
        </main>
      </div>
    </div>
  )
}
