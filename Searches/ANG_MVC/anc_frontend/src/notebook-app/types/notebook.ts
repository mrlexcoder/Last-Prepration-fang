export type SourceType = 'pdf' | 'website' | 'text' | 'video' | 'audio' | 'drive'

export interface NotebookSource {
  id: string
  title: string
  type: SourceType
  addedAt: string
}

export interface NotebookMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface StudioOutput {
  id: string
  type: string
  title: string
  createdAt: string
}

export type ChatPhase = 'welcome' | 'chat'
export type ResearchStatus = 'idle' | 'searching' | 'done'

export interface StudioFeature {
  id: string
  title: string
  icon: string
  colorClass: string
  beta?: boolean
}

/** Library list item */
export interface NotebookListItem {
  id: string
  title: string
  updatedAt: string
  sourceCount: number
}

/** Curated featured card (NotebookLM home) */
export interface FeaturedNotebook {
  id: string
  category: string
  categoryIcon: string
  title: string
  date: string
  sourceCount: number
  gradient?: string
  imageHint?: 'chart' | 'dna' | 'travel' | 'business'
}

export interface NotebookWorkspace {
  title: string
  sources: NotebookSource[]
  messages: NotebookMessage[]
  studioOutputs: StudioOutput[]
  notes: { id: string; content: string }[]
  chatPhase: ChatPhase
  welcomeDismissed: boolean
  welcomeModalOpen: boolean
}

export type LibraryFilter = 'all' | 'featured'
export type LibraryView = 'grid' | 'list'
export type LibrarySort = 'recent' | 'title'
