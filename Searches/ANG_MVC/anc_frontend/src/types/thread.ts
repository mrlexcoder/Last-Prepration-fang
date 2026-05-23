/** Frontend-only thread JSON — mirrors Claude-style API shape */

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'thinking' | 'streaming' | 'complete' | 'error'

export interface ThinkingStep {
  id: string
  label: string
  content: string
  status: 'pending' | 'active' | 'done'
}

export interface ThinkingBlock {
  visible: boolean
  collapsed: boolean
  durationMs?: number
  steps: ThinkingStep[]
}

export interface ThreadMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  status?: MessageStatus
  thinking?: ThinkingBlock
  /** Token stream chunks for UI simulation */
  streamChunks?: string[]
  /** Web sources from live search */
  sources?: string[]
  /** Whether this message used live web data */
  liveScrape?: boolean
  /** Metadata from the backend (provider, latency, etc.) */
  meta?: {
    provider?: string
    latencyMs?: number
    sources?: string[]
    liveScrape?: boolean
    memoryUsed?: string[]
    contextSources?: number
    agentSteps?: any[]
  }
}

export interface Thread {
  id: string
  title: string
  module: 'chat' | 'code' | 'docs' | 'analysis'
  updatedAt: string
  messages: ThreadMessage[]
}

export interface ThreadListItem {
  id: string
  title: string
  module: Thread['module']
  preview: string
  updatedAt: string
}
