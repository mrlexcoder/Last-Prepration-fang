import { useState, useRef, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { WelcomeModal } from '@/notebook-app/components/editor/WelcomeModal'
import { cn } from '@/lib/utils'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'
import { VoiceChat } from '@/components/VoiceChat'

const SUGGESTIONS = [
  'Start a project',
  'Learn or understand something',
  'Create a podcast, video, slide deck, etc.',
  'Something else...',
]

function renderMarkdownLite(text: string) {
  const parts = text.split('**')
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  )
}

export function ChatPanel() {
  const chatPhase = useNotebookEditorStore((s) => s.chatPhase)
  const messages = useNotebookEditorStore((s) => s.messages)
  const sources = useNotebookEditorStore((s) => s.sources)
  const isGenerating = useNotebookEditorStore((s) => s.isGenerating)
  const selectSuggestion = useNotebookEditorStore((s) => s.selectSuggestion)
  const sendChatMessage = useNotebookEditorStore((s) => s.sendChatMessage)
  const saveMessageToNote = useNotebookEditorStore((s) => s.saveMessageToNote)
  const [input, setInput] = useState('')
  const [showVoice, setShowVoice] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const t = input.trim()
    if (!t || isGenerating) return
    setInput('')
    void sendChatMessage(t)
  }

  const showWelcome = chatPhase === 'welcome' && messages.length === 0

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-surface">
      <WelcomeModal />

      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft/80">
        <span className="text-sm font-medium text-text">Chat</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoice(!showVoice)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition ${showVoice ? 'bg-red-500 text-white' : 'bg-sidebar hover:bg-sidebar/80'}`}
          >
            🎤 {showVoice ? 'Hide Voice' : 'Voice Control (Pro)'}
          </button>
          <button
            type="button"
            className="rounded-full p-1.5 text-text-muted hover:bg-sidebar"
          >
            <Icon name="more_vert" size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {showWelcome ? (
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-normal text-text">
              👋 Let&apos;s start your notebook...
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
              This notebook is a blank canvas. Add sources or search the web, then
              ask ANC to summarize, compare, or turn your material into audio, slides,
              and more.
            </p>
            <p className="mt-6 text-[15px] text-text">
              What would you like this notebook to help you do?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {SUGGESTIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectSuggestion(label)}
                  className="w-fit rounded-full border border-border-soft px-4 py-2.5 text-sm text-text hover:bg-sidebar hover:border-google-blue/30 transition-colors text-left"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-8">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <span className="rounded-2xl bg-sidebar px-4 py-2 text-sm text-text max-w-[85%]">
                    {m.content}
                  </span>
                </div>
              ) : (
                <motion.article
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[15px] leading-relaxed text-text whitespace-pre-wrap"
                >
                  {renderMarkdownLite(m.content)}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveMessageToNote(m.id)}
                      className="flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-sm text-text hover:bg-sidebar"
                    >
                      <Icon name="note_add" size={18} />
                      Save to note
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 text-text-muted hover:bg-sidebar"
                      title="Copy"
                    >
                      <Icon name="content_copy" size={20} />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 text-text-muted hover:bg-sidebar"
                    >
                      <Icon name="thumb_up" size={20} />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 text-text-muted hover:bg-sidebar"
                    >
                      <Icon name="thumb_down" size={20} />
                    </button>
                  </div>
                </motion.article>
              )
            )}
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-google-blue border-t-transparent" />
                ANC is thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {showVoice && (
        <div className="border-t border-border-soft p-4 bg-surface/50">
          <VoiceChat />
        </div>
      )}

      <form onSubmit={submit} className="border-t border-border-soft p-4">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border-soft bg-surface shadow-sm focus-within:border-google-blue/40 focus-within:shadow-md transition-shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask a question or create something"
            rows={2}
            disabled={isGenerating}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-xs text-text-muted">
              {sources.length} source{sources.length !== 1 ? 's' : ''}
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                input.trim()
                  ? 'bg-google-blue text-white hover:bg-google-blue-dark'
                  : 'bg-sidebar text-text-muted'
              )}
            >
              <Icon name="arrow_forward" size={22} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
