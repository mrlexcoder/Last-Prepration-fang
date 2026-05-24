/**
 * ANG Backend API client
 * All calls proxy through Vite dev server → http://localhost:8081
 */

export type ANGMode = 'chat' | 'search' | 'tools' | 'pipeline' | 'web' | 'agentscope' | 'loop' | 'infer'
export type RuntimeHint = 'runtime_adapter_hf' | 'runtime_adapter_llama' | 'runtime_adapter_agentscope' | 'runtime_adapter_stub' | null

export interface ANGInferRequest {
  input: string
  latency_budget_ms?: number
  runtime_hint?: RuntimeHint
}

export interface ANGInferResponse {
  runtime: string
  output: string
  confidence: number
  meta: { latency_ms?: number; provider?: string; model?: string }
}

export interface VoiceCommandRequest {
  command: string
}

export interface VoiceCommandResponse {
  executed: boolean
  action?: string
  result: string
  spoken_response: string
}

export async function sendVoiceCommand(command: string): Promise<VoiceCommandResponse> {
  const res = await fetch('/api/pro/agi/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
  if (!res.ok) throw new Error('Voice command failed')
  return res.json()
}

export interface ANGBridgeRequest {
  mode: ANGMode
  input: string
  runtime_hint?: RuntimeHint
  history?: { user: string; assistant: string }[]
  tools?: string[]
  steps?: string[]
  user_id?: string
  session_id?: string
  use_letta?: boolean
  use_ensemble?: boolean
  force_live?: boolean
}

export interface ANGBridgeResponse {
  mode: string
  output: string
  confidence?: number
  runtime?: string
  sources?: string[]
  called_tool?: string | null
  steps_run?: number
  final_output?: string
  pipeline?: { step: number; prompt: string; output: string }[]
  chunks_used?: number
  live_scrape?: boolean
  latency_ms?: number
  memory_used?: string[]
  context_sources?: number
  reasoning_trace?: Record<string, string> | null
  agents_used?: string[]
}

export interface ANGLoopRequest {
  input: string
  max_iterations?: number
  confidence_threshold?: number
  runtime_hint?: RuntimeHint
}

export interface ANGLoopResponse {
  iterations: number
  final_output: string
  final_confidence: number
  runtime: string
  loop_history: { iteration: number; input: string; output: string; confidence: number }[]
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export const angApi = {
  infer: (req: ANGInferRequest) =>
    post<ANGInferResponse>('/api/infer', req),

  bridge: (req: ANGBridgeRequest) =>
    post<ANGBridgeResponse>('/api/bridge', req),

  loop: (req: ANGLoopRequest) =>
    post<ANGLoopResponse>('/api/loop', req),

  health: () => get<{ status: string; service: string }>('/api/health'),

  connectors: () =>
    get<{ count: number; adapters: { id: string; name: string; capabilities: string[]; latency_ms: number }[] }>(
      '/api/connectors'
    ),

  agiStatus: () =>
    get<{
      world_model: unknown
      goal_engine: unknown
      meta_cognition: unknown
    }>('/admin/agi-status'),

  cacheStats: () =>
    get<{ total_entries: number; faiss_available: boolean; index_size: number; cache_dir: string }>(
      '/admin/cache-stats'
    ),

  refreshConnectors: () =>
    post<{ refreshed: boolean; adapter_count: number }>('/admin/refresh-connectors', {}),
}
