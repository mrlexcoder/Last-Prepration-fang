import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'

interface SourcesPanelProps {
  onToggleCollapse?: () => void
}

export function SourcesPanel({ onToggleCollapse }: SourcesPanelProps) {
  const setAddOpen = useNotebookEditorStore((s) => s.setAddSourcesOpen)
  const sources = useNotebookEditorStore((s) => s.sources)
  const query = useNotebookEditorStore((s) => s.sourceSearchQuery)
  const setQuery = useNotebookEditorStore((s) => s.setSourceSearchQuery)
  const researchMode = useNotebookEditorStore((s) => s.researchMode)
  const setResearchMode = useNotebookEditorStore((s) => s.setResearchMode)
  const researchStatus = useNotebookEditorStore((s) => s.researchStatus)
  const runSearch = useNotebookEditorStore((s) => s.runSourceSearch)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f8f9fc] rounded-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border-soft/80 px-4 py-3">
        <span className="text-sm font-medium text-text">Sources</span>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full p-1.5 text-text-muted hover:bg-white transition-colors"
          title="Hide Sources panel"
        >
          <Icon name="dock_to_left" size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border-soft bg-surface py-3 text-sm font-medium text-text hover:border-google-blue/30 hover:bg-white transition-colors"
        >
          <Icon name="add" size={22} />
          Add sources
        </button>

        <div className="shrink-0 rounded-2xl border border-border-soft bg-surface p-3">
          <p className="mb-2 text-xs text-text-muted">
            Search the web for new sources
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-2 py-1.5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void runSearch()}
              placeholder="Search..."
              className="min-w-[80px] flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setResearchMode('web')}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs',
                researchMode === 'web'
                  ? 'bg-google-blue-bg text-google-blue'
                  : 'text-text-muted hover:bg-white'
              )}
            >
              <Icon name="language" size={16} />
              Web
            </button>
            <button
              type="button"
              onClick={() => setResearchMode('fast')}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs',
                researchMode === 'fast'
                  ? 'bg-google-blue-bg text-google-blue'
                  : 'text-text-muted hover:bg-white'
              )}
            >
              <Icon name="travel_explore" size={16} />
              Fast research
            </button>
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={researchStatus === 'searching'}
              className="shrink-0 rounded-full p-1.5 text-text-muted hover:bg-white disabled:opacity-50"
            >
              <Icon name="search" size={20} />
            </button>
          </div>
        </div>

        {researchStatus === 'searching' && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-text-secondary">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-google-blue border-t-transparent" />
            Researching websites...
          </div>
        )}

        {sources.length > 0 ? (
          <ul className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-sm"
              >
                <Icon name="description" size={20} className="shrink-0 text-google-blue" />
                <span className="min-w-0 flex-1 truncate">{s.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-2 py-6 text-center">
            <Icon name="folder_open" size={40} className="text-text-muted/50" />
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Saved sources will appear here. Click{' '}
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="text-google-blue hover:underline"
              >
                Add source
              </button>{' '}
              above to add PDFs, websites, text, videos or audio files. Or import
              a file directly from Google Drive.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
