import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { angApi } from '@/lib/angApi'
import { useAuthStore } from '@/store/authStore'

interface StatCard {
  label: string
  value: string | number
  icon: string
  color: string
}

export function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [health, setHealth] = useState<{ status: string } | null>(null)
  const [connectors, setConnectors] = useState<{ count: number; adapters: { id: string; name: string; capabilities: string[]; latency_ms: number }[] } | null>(null)
  const [agiStatus, setAgiStatus] = useState<Record<string, unknown> | null>(null)
  const [cacheStats, setCacheStats] = useState<{ total_entries: number; faiss_available: boolean; index_size: number } | null>(null)
  const [learningStats, setLearningStats] = useState<{ signals_processed: number; online_steps: number; batch_trains: number } | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [h, c, a, cs, ls] = await Promise.all([
        angApi.health(),
        angApi.connectors(),
        angApi.agiStatus(),
        angApi.cacheStats(),
        angApi.learningStats(),
      ])
      setHealth(h)
      setConnectors(c)
      setAgiStatus(a as Record<string, unknown>)
      setCacheStats(cs)
      setLearningStats(ls)
    } catch (e) {
      setError(`Backend unreachable: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

   useEffect(() => {
     Promise.resolve().then(() => fetchAll())
   }, [])

  const handleRefreshConnectors = async () => {
    setRefreshing(true)
    try {
      await angApi.refreshConnectors()
      await fetchAll()
    } finally {
      setRefreshing(false)
    }
  }

  const statCards: StatCard[] = [
    { label: 'Backend', value: health?.status ?? '…', icon: 'check_circle', color: health?.status === 'ok' ? 'text-green-600' : 'text-red-500' },
    { label: 'Adapters', value: connectors?.count ?? '…', icon: 'hub', color: 'text-blue-600' },
    { label: 'Cache entries', value: cacheStats?.total_entries ?? '…', icon: 'database', color: 'text-purple-600' },
    { label: 'Learning', value: learningStats?.signals_processed ?? '…', icon: 'auto_awesome', color: 'text-indigo-600' },
  ]

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border-soft bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2 rounded-full p-1.5 hover:bg-sidebar">
            <Icon name="arrow_back" size={20} className="text-text-muted" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <Icon name="admin_panel_settings" size={18} />
          </div>
          <span className="text-lg font-semibold text-text">ANG Admin</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchAll()}
            className="flex items-center gap-2 rounded-full border border-border-soft px-3 py-1.5 text-sm text-text hover:bg-sidebar"
          >
            <Icon name="refresh" size={18} />
            Refresh
          </button>
          <div className="flex items-center gap-2 rounded-full bg-sidebar px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm font-medium text-text">{user?.name}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full p-2 text-text-muted hover:bg-sidebar"
            title="Sign out"
          >
            <Icon name="logout" size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <Icon name="error" size={20} />
            {error}
            <button type="button" onClick={() => void fetchAll()} className="ml-auto font-medium underline">Retry</button>
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{card.label}</span>
                <Icon name={card.icon} size={20} className={card.color} />
              </div>
              <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                {loading ? <span className="animate-pulse text-text-muted">…</span> : card.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Connectors */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-text">
                <Icon name="hub" size={20} className="text-blue-600" />
                Runtime Adapters
              </h2>
              <button
                type="button"
                onClick={() => void handleRefreshConnectors()}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <Icon name="refresh" size={16} className={refreshing ? 'animate-spin' : ''} />
                Hot reload
              </button>
            </div>
            {connectors?.adapters.map((a) => (
              <div key={a.id} className="mb-3 rounded-xl border border-border-soft p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{a.name}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{a.latency_ms}ms</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.capabilities.map((c) => (
                    <span key={c} className="rounded-full bg-sidebar px-2 py-0.5 text-xs text-text-muted">{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>

          {/* AGI Status */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text">
              <Icon name="psychology" size={20} className="text-purple-600" />
              AGI Layer Status
            </h2>
            {agiStatus && Object.entries(agiStatus).map(([key, val]) => (
              <div key={key} className="mb-3 rounded-xl border border-border-soft p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{key.replace(/_/g, ' ')}</p>
                {typeof val === 'object' && val !== null ? (
                  <pre className="overflow-x-auto rounded-lg bg-sidebar p-2 text-xs text-text-secondary">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-text">{String(val)}</p>
                )}
              </div>
            ))}
          </motion.section>

{/* Cache Stats */}
           <motion.section
             initial={{ opacity: 0, y: 16 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm"
           >
             <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text">
               <Icon name="database" size={20} className="text-indigo-600" />
               InfinityCache
             </h2>
             {cacheStats && (
               <div className="space-y-3">
                 {[
                   { label: 'Total entries', value: cacheStats.total_entries },
                   { label: 'FAISS index size', value: cacheStats.index_size },
                   { label: 'Vector search', value: cacheStats.faiss_available ? '✅ Active' : '⚠️ Fallback (no faiss)' },
                 ].map((row) => (
                   <div key={row.label} className="flex items-center justify-between rounded-xl bg-sidebar px-4 py-2.5">
                     <span className="text-sm text-text-muted">{row.label}</span>
                     <span className="text-sm font-medium text-text">{row.value}</span>
                   </div>
                 ))}
               </div>
             )}
           </motion.section>

           {/* Auto-Learning Stats */}
           <motion.section
             initial={{ opacity: 0, y: 16 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.32 }}
             className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm"
           >
             <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text">
               <Icon name="auto_awesome" size={20} className="text-indigo-600" />
               Auto-Learning System
             </h2>
             {learningStats && (
               <div className="space-y-3">
                 {[
                   { label: 'Signals Processed', value: learningStats.signals_processed },
                   { label: 'Online LoRA Steps', value: learningStats.online_steps },
                   { label: 'Batch Trains', value: learningStats.batch_trains },
                 ].map((row) => (
                   <div key={row.label} className="flex items-center justify-between rounded-xl bg-sidebar px-4 py-2.5">
                     <span className="text-sm text-text-muted">{row.label}</span>
                     <span className="text-sm font-medium text-text">{row.value}</span>
                   </div>
                 ))}
               </div>
             )}
           </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text">
              <Icon name="bolt" size={20} className="text-yellow-600" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Open ANC Chat', icon: 'chat', href: '/app', external: false },
                { label: 'Open ANC Notebook', icon: 'menu_book', href: '/notebook', external: false },
                { label: 'API Docs (FastAPI)', icon: 'api', href: 'http://localhost:8081/docs', external: true },
                { label: 'Health Check', icon: 'monitor_heart', href: 'http://localhost:8081/api/health', external: true },
              ].map((action) => (
                action.external ? (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border-soft px-4 py-3 text-sm text-text hover:bg-sidebar transition-colors"
                  >
                    <Icon name={action.icon} size={20} className="text-text-muted" />
                    {action.label}
                    <Icon name="open_in_new" size={16} className="ml-auto text-text-muted" />
                  </a>
                ) : (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border-soft px-4 py-3 text-sm text-text hover:bg-sidebar transition-colors"
                  >
                    <Icon name={action.icon} size={20} className="text-text-muted" />
                    {action.label}
                    <Icon name="arrow_forward" size={16} className="ml-auto text-text-muted" />
                  </Link>
                )
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
