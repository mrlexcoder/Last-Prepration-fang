import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { FeaturedNotebook } from '@/notebook-app/types/notebook'

interface FeaturedNotebookCardProps {
  notebook: FeaturedNotebook
}

export function FeaturedNotebookCard({ notebook }: FeaturedNotebookCardProps) {
  return (
    <article
      className={cn(
        'relative flex h-[200px] w-[280px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-md',
        'bg-gradient-to-br',
        notebook.gradient ?? 'from-[#5f6368] to-[#3c4043]'
      )}
    >
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
          <Icon name={notebook.categoryIcon} size={16} />
          {notebook.category}
        </div>
        <h3 className="mt-3 text-lg font-medium leading-snug line-clamp-3">
          {notebook.title}
        </h3>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-xs opacity-80">
          <p>{notebook.date}</p>
          <p>{notebook.sourceCount} sources</p>
        </div>
        <Icon name="public" size={18} className="opacity-70" />
      </div>
    </article>
  )
}
