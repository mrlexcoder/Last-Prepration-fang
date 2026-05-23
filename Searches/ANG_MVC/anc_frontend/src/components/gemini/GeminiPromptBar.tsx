import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { AttachMenuTrigger } from '@/components/gemini/AttachMenuTrigger'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'
import { useUiStore, type GeminiModel } from '@/store/uiStore'
import type { RuntimeHint } from '@/lib/angApi'

const models: { id: GeminiModel; label: string; hint: RuntimeHint }[] = [
  { id: 'flash', label: 'Stub (fast)', hint: 'runtime_adapter_stub' },
  { id: 'pro', label: 'Qwen 2.5', hint: 'qwen-2.5-4b-instruct' },
  { id: 'thinking', label: 'llama.cpp', hint: 'llama.cpp' },
]

const MODES = [
  { id: 'chat',     label: 'Chat',     icon: 'forum' },
  { id: 'search',   label: 'Search',   icon: 'travel_explore' },
  { id: 'web',      label: 'Web',      icon: 'public' },
  { id: 'loop',     label: 'Loop',     icon: 'loop' },
  { id: 'pipeline', label: 'Pipeline', icon: 'account_tree' },
  { id: 'tools',    label: 'Tools',    icon: 'build' },
  { id: 'infer',      label: 'Infer',      icon: 'bolt' },
  { id: 'agentscope', label: 'AgentScope', icon: 'groups' },
] as const

interface GeminiPromptBarProps {
  centered?: boolean
  className?: string
}

export function GeminiPromptBar({ centered, className }: GeminiPromptBarProps) {
  const [text, setText] = useState('')
  const [modelOpen, setModelOpen] = useState(false)
  const modelRef = useRef<HTMLDivElement>(null)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const isGenerating = useChatStore((s) => s.isGenerating)
  const setRuntimeHint = useChatStore((s) => s.setRuntimeHint)
  const setMode = useChatStore((s) => s.setMode)
  const currentMode = useChatStore((s) => s.mode)
  const selectedModel = useUiStore((s) => s.selectedModel)
  const setSelectedModel = useUiStore((s) => s.setSelectedModel)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed || isGenerating) return
    setText('')
    await sendMessage(trimmed)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  const hasText = text.trim().length > 0

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full',
        centered ? 'max-w-[720px] mx-auto' : 'max-w-[720px] mx-auto px-4 pb-6',
        className
      )}
    >
      {/* Mode tabs */}
      <div className="mb-2 flex flex-wrap gap-1.5 px-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              currentMode === m.id
                ? 'bg-google-blue text-white'
                : 'bg-sidebar text-text-secondary hover:bg-google-blue-hover'
            )}
          >
            <Icon name={m.icon} size={14} />
            {m.label}
          </button>
        ))}
      </div>
      <div
        className={cn(
          'prompt-bar-focus flex flex-col rounded-[28px] border border-border-soft bg-surface shadow-md transition-shadow',
          'min-h-[56px]'
        )}
      >
        <div className="flex items-end gap-1 px-2 py-2">
          <AttachMenuTrigger />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask ANC"
            rows={1}
            disabled={isGenerating}
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-3 text-base text-text placeholder:text-text-muted focus:outline-none disabled:opacity-60"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />

          <div className="flex shrink-0 items-center gap-0.5 pb-1 pr-1">
            <button
              type="button"
              className="rounded-full p-2 text-text-muted hover:bg-sidebar transition-colors"
              title="Tools"
            >
              <Icon name="tune" size={22} />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-text-muted hover:bg-sidebar transition-colors"
              title="Deep search"
            >
              <Icon name="travel_explore" size={22} />
            </button>

            <div className="relative" ref={modelRef}>
              <button
                type="button"
                onClick={() => setModelOpen((o) => !o)}
                className="flex items-center gap-0.5 rounded-full px-2 py-2 text-sm text-text-secondary hover:bg-sidebar transition-colors"
              >
                {models.find((m) => m.id === selectedModel)?.label}
                <Icon name="expand_more" size={20} />
              </button>
              {modelOpen && (
                <div className="absolute bottom-full right-0 mb-2 min-w-[160px] rounded-xl border border-border-soft bg-surface py-1 shadow-lg">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id)
                        setRuntimeHint(m.hint)
                        setModelOpen(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-sidebar',
                        selectedModel === m.id && 'text-google-blue font-medium'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasText ? (
              <button
                type="submit"
                disabled={isGenerating}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-google-blue text-white hover:bg-google-blue-dark transition-colors disabled:opacity-50"
                title="Send"
              >
                <Icon name="arrow_upward" size={22} />
              </button>
            ) : (
              <button
                type="button"
                className="ml-1 rounded-full p-2.5 text-text-muted hover:bg-sidebar transition-colors"
                title="Voice"
              >
                <Icon name="mic" size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
