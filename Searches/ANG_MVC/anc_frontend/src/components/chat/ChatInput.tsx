import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { GradientButton } from '@/components/ui/GradientButton'
import { Icon } from '@/components/icons/Icon'
import { useChatStore } from '@/store/chatStore'

export function ChatInput() {
  const [text, setText] = useState('')
  const sendMessage = useChatStore((s) => s.sendMessage)
  const isGenerating = useChatStore((s) => s.isGenerating)

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

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-border bg-surface-elevated/80 p-4 backdrop-blur-md"
    >
      <div className="relative rounded-2xl border border-border bg-surface-muted p-1 focus-within:border-google-blue/50 focus-within:ring-2 focus-within:ring-google-blue/15">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message ANC…"
          rows={2}
          disabled={isGenerating}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex gap-1 text-text-muted">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/5 hover:text-google-blue transition-colors"
              title="Attach"
            >
              <Icon name="attach_file" size={20} />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/5 hover:text-google-blue transition-colors"
              title="Module"
            >
              <Icon name="hub" size={20} />
            </button>
          </div>
          <GradientButton
            type="submit"
            disabled={!text.trim() || isGenerating}
            className="!py-2 !px-4"
          >
            <Icon name="send" size={18} />
            Send
          </GradientButton>
        </div>
      </div>
    </form>
  )
}
