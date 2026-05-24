import React, { useState, useEffect } from 'react'

interface Status {
  initialized: boolean
  autonomous_running: boolean
  last_thoughts: string[]
  tools_available: string[]
}

interface Improvement {
  timestamp: number
  data: any
}

export function ProAGIDashboard() {
  const [status, setStatus] = useState<Status | null>(null)
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [thoughts, setThoughts] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/pro/agi/status')
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      console.error('Failed to fetch status')
    }
  }

  const fetchImprovements = async () => {
    try {
      const res = await fetch('/api/pro/agi/improvements?limit=15')
      const data = await res.json()
      setImprovements(data)
    } catch (e) {}
  }

  const fetchThoughts = async () => {
    try {
      const res = await fetch('/api/pro/agi/current_thoughts')
      const data = await res.json()
      setThoughts(data)
    } catch (e) {}
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/pro/agi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      setResponse(data)
      setMessage('')
      fetchThoughts()
    } catch (e) {
      setResponse({ error: 'Failed to communicate with Pro AGI' })
    }
    setLoading(false)
  }

  const toggleAutonomous = async (start: boolean) => {
    await fetch(`/api/pro/agi/autonomous/${start ? 'start' : 'stop'}`, { method: 'POST' })
    fetchStatus()
  }

  useEffect(() => {
    fetchStatus()
    fetchImprovements()
    fetchThoughts()

    const interval = setInterval(() => {
      fetchStatus()
      fetchThoughts()
    }, 3000) // Poll every 3s for live feel

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', background: '#0a0a0a', color: '#0f0', minHeight: '100vh' }}>
      <h1>🧠 PRO AGI MASTER DASHBOARD</h1>
      <p>Real-time view of the top-level autonomous AGI brain</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Status */}
        <div style={{ border: '1px solid #0f0', padding: 16 }}>
          <h2>Status</h2>
          {status ? (
            <>
              <p>Autonomous: <strong>{status.autonomous_running ? 'RUNNING' : 'STOPPED'}</strong></p>
              <button onClick={() => toggleAutonomous(!status.autonomous_running)}>
                {status.autonomous_running ? 'STOP AUTONOMY' : 'START AUTONOMY'}
              </button>
              <p>Tools: {status.tools_available?.length || 0}</p>
            </>
          ) : 'Loading...'}
        </div>

        {/* Live Thoughts */}
        <div style={{ border: '1px solid #0f0', padding: 16 }}>
          <h2>Current Thoughts / Actions</h2>
          <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 13 }}>
            {thoughts.length > 0 ? thoughts.map((t, i) => <div key={i}>• {t}</div>) : 'No thoughts yet...'}
          </div>
        </div>

        {/* Chat with Pro AGI */}
        <div style={{ border: '1px solid #0f0', padding: 16, gridColumn: 'span 2' }}>
          <h2>Communicate with Pro AGI</h2>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell the Pro AGI what to do or analyze..."
            style={{ width: '100%', height: 80, background: '#111', color: '#0f0', border: '1px solid #0f0' }}
          />
          <button onClick={sendMessage} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Thinking...' : 'SEND TO PRO AGI'}
          </button>

          {response && (
            <pre style={{ marginTop: 12, background: '#111', padding: 12, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>

        {/* Improvement History */}
        <div style={{ border: '1px solid #0f0', padding: 16, gridColumn: 'span 2' }}>
          <h2>Persistent Improvement History (Long-term Memory)</h2>
          <div style={{ maxHeight: 250, overflowY: 'auto' }}>
            {improvements.length > 0 ? (
              improvements.map((imp, i) => (
                <div key={i} style={{ marginBottom: 8, fontSize: 12 }}>
                  {new Date(imp.timestamp * 1000).toLocaleTimeString()} — {JSON.stringify(imp.data?.action || imp)}
                </div>
              ))
            ) : 'No improvements recorded yet. The Pro AGI will start logging here as it self-improves.'}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 30, fontSize: 11, opacity: 0.6 }}>
        This dashboard shows the Pro AGI thinking in real-time. It uses quantum-physics reasoning, self-improves aggressively, and has full control over the system.
      </p>
    </div>
  )
}
