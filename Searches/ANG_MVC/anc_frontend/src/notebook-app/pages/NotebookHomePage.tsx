import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import { NotebookHomeHeader } from '@/notebook-app/layout/NotebookHomeHeader'
import { FeaturedNotebookCard } from '@/notebook-app/components/home/FeaturedNotebookCard'
import { RecentNotebookCard } from '@/notebook-app/components/home/RecentNotebookCard'
import { CreateNotebookCard } from '@/notebook-app/components/home/CreateNotebookCard'
import { FEATURED_NOTEBOOKS } from '@/notebook-app/data/featured-notebooks'
import { useNotebookLibraryStore } from '@/notebook-app/store/libraryStore'

export function NotebookHomePage() {
  const navigate = useNavigate()
  const filter = useNotebookLibraryStore((s) => s.filter)
  const setFilter = useNotebookLibraryStore((s) => s.setFilter)
  const view = useNotebookLibraryStore((s) => s.view)
  const setView = useNotebookLibraryStore((s) => s.setView)
  const sort = useNotebookLibraryStore((s) => s.sort)
  const setSort = useNotebookLibraryStore((s) => s.setSort)
  const searchQuery = useNotebookLibraryStore((s) => s.searchQuery)
  const setSearchQuery = useNotebookLibraryStore((s) => s.setSearchQuery)
  const notebooks = useNotebookLibraryStore((s) => s.notebooks)
  const createNotebook = useNotebookLibraryStore((s) => s.createNotebook)
  const deleteNotebook = useNotebookLibraryStore((s) => s.deleteNotebook)

  const sortedNotebooks = useMemo(() => {
    let list = [...notebooks]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q))
    }
    if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }
    return list
  }, [notebooks, searchQuery, sort])

  const handleCreate = () => {
    const id = createNotebook()
    navigate(`/notebook/n/${id}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f9]">
      <NotebookHomeHeader />

      <div className="border-b border-border-soft bg-surface px-6 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-sidebar p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                filter === 'all'
                  ? 'bg-surface text-text font-medium shadow-sm'
                  : 'text-text-secondary hover:text-text'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('featured')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                filter === 'featured'
                  ? 'bg-surface text-text font-medium shadow-sm'
                  : 'text-text-secondary hover:text-text'
              )}
            >
              Featured notebooks
            </button>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative hidden md:block">
              <Icon
                name="search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notebooks"
                className="h-10 w-48 rounded-full border border-border-soft bg-surface-subtle pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-google-blue/20"
              />
            </div>
            <div className="flex rounded-full border border-border-soft bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={cn(
                  'rounded-full p-2',
                  view === 'grid' && 'bg-sidebar'
                )}
                title="Grid"
              >
                <Icon name="grid_view" size={20} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'rounded-full p-2',
                  view === 'list' && 'bg-sidebar'
                )}
                title="List"
              >
                <Icon name="view_list" size={20} />
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-border-soft px-3 py-2 text-sm text-text hover:bg-sidebar"
              onClick={() =>
                setSort(sort === 'recent' ? 'title' : 'recent')
              }
            >
              {sort === 'recent' ? 'Most recent' : 'Title'}
              <Icon name="expand_more" size={18} />
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors"
            >
              <Icon name="add" size={20} />
              Create new
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {(filter === 'all' || filter === 'featured') && (
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-text">
                  Featured notebooks
                </h2>
                <button
                  type="button"
                  className="text-sm text-text-secondary hover:text-google-blue"
                >
                  See all
                  <Icon name="chevron_right" size={18} className="inline ml-0.5" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {FEATURED_NOTEBOOKS.map((nb) => (
                  <FeaturedNotebookCard key={nb.id} notebook={nb} />
                ))}
              </div>
            </section>
          )}

          {filter === 'all' && (
            <section>
              <h2 className="mb-4 text-lg font-medium text-text">
                Recent notebooks
              </h2>
              <div
                className={cn(
                  view === 'grid'
                    ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                    : 'flex flex-col gap-2'
                )}
              >
                <CreateNotebookCard onClick={handleCreate} />
                {sortedNotebooks.map((nb) => (
                  <RecentNotebookCard
                    key={nb.id}
                    notebook={nb}
                    onDelete={deleteNotebook}
                  />
                ))}
              </div>
              {sortedNotebooks.length === 0 && (
                <p className="mt-6 text-center text-sm text-text-muted">
                  No notebooks yet. Click <strong>Create new</strong> to start.
                </p>
              )}
            </section>
          )}

          {filter === 'featured' && (
            <p className="text-sm text-text-muted">
              Browse curated examples above. Switch to <strong>All</strong> to see
              your notebooks.
            </p>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-text-muted">
        ANC Notebook can be inaccurate; please double-check its responses.
      </footer>
    </div>
  )
}
