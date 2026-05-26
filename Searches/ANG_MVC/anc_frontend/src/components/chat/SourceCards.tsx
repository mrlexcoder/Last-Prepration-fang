import { motion } from 'framer-motion'

interface Source {
  url: string
  title?: string
}

interface SourceCardsProps {
  sources: string[] | Source[]
  live?: boolean
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.slice(0, 30)
  }
}

function getFavicon(url: string): string {
  try {
    const { origin } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=16`
  } catch {
    return ''
  }
}

function normalise(s: string | Source): Source {
  return typeof s === 'string' ? { url: s } : s
}

export function SourceCards({ sources, live }: SourceCardsProps) {
  if (!sources || sources.length === 0) return null
  const items = sources.map(normalise).filter(s => s.url.startsWith('http'))
  if (items.length === 0) return null

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        {live && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Live web
          </span>
        )}
        <span>{items.length} source{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.slice(0, 6).map((src, i) => (
          <motion.a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            title={src.title ?? src.url}
            className="flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs text-text-muted hover:border-google-blue hover:text-google-blue transition-colors max-w-[220px]"
          >
            <img
              src={getFavicon(src.url)}
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="truncate">
              {src.title ? src.title.slice(0, 28) : getDomain(src.url)}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
