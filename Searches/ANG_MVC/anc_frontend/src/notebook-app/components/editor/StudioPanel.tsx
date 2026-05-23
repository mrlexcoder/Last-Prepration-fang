import { motion } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { STUDIO_FEATURES } from '@/notebook-app/data/studio-features'
import { cn } from '@/lib/utils'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'

interface StudioPanelProps {
  onToggleCollapse?: () => void
}

export function StudioPanel({ onToggleCollapse }: StudioPanelProps) {
  const outputs = useNotebookEditorStore((s) => s.studioOutputs)
  const createOutput = useNotebookEditorStore((s) => s.createStudioOutput)
  const addNote = useNotebookEditorStore((s) => s.addNote)
  const sourcesCount = useNotebookEditorStore((s) => s.sources.length)

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#f8f9fc]">
      <div className="flex shrink-0 items-center justify-between border-b border-border-soft/80 px-4 py-3">
        <span className="text-sm font-medium text-text">Studio</span>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full p-1.5 text-text-muted hover:bg-white transition-colors"
          title="Hide Studio panel"
        >
          <Icon name="dock_to_right" size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4 pb-20">
        <div className="shrink-0 rounded-xl bg-gradient-to-r from-[#e8def8] via-[#d7efff] to-[#ceead6] px-3 py-2 text-xs leading-relaxed text-text-secondary">
          Create an Audio Overview in: Hindi, Bengali, Gujarati, Kannada, Malayalam,
          Marathi, Punjabi, Tamil, Telugu, or English.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STUDIO_FEATURES.map((f, i) => (
            <motion.button
              key={f.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => createOutput(f.id, f.title)}
              disabled={sourcesCount === 0}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium transition-shadow disabled:opacity-50',
                f.colorClass,
                'hover:shadow-md'
              )}
            >
              <Icon name={f.icon} size={22} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{f.title}</span>
              {f.beta && (
                <span className="shrink-0 rounded bg-[#1f1f1f] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  BETA
                </span>
              )}
              <Icon name="chevron_right" size={18} className="shrink-0 opacity-60" />
            </motion.button>
          ))}
        </div>

        {outputs.length > 0 ? (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-medium text-text-muted">Generated</p>
            {outputs.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-sm"
              >
                {o.title}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center px-2 text-center">
            <Icon name="auto_awesome" size={36} className="text-text-muted/40" />
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Studio output will be saved here. After adding sources, click to add
              Audio Overview, study guide and more!
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => addNote('New note')}
        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-black transition-colors"
      >
        <Icon name="note_add" size={20} />
        Add note
      </button>
    </div>
  )
}
