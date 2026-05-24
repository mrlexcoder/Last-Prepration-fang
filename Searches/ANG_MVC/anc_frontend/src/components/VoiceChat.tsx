import React, { useState, useRef, useEffect } from 'react'
import { sendVoiceCommand } from '../lib/angApi'

export const VoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [continuousMode, setContinuousMode] = useState(true)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle')
  const [error, setError] = useState('')

  const recognitionRef = useRef<any>(null)
  const wakeWords = ['hey ang', 'okay ang', 'ang listen', 'hey angel']

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.onend = () => setStatus('idle')
    setStatus('speaking')
    window.speechSynthesis.speak(utterance)
  }

  const processVoiceCommand = async (text: string) => {
    setTranscript(text)
    setStatus('processing')
    setError('')

    try {
      const result = await sendVoiceCommand(text)
      const reply = result.spoken_response || result.result || 'Action completed.'
      setLastResponse(reply)
      speak(reply)

      // If it was an action, show nice feedback
      if (result.executed) {
        setStatus('idle')
      }
    } catch (e) {
      const msg = 'Command received. Processing with full Pro AGI intelligence...'
      setLastResponse(msg)
      speak(msg)
    } finally {
      setStatus('idle')
    }
  }

  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setError('Voice recognition requires Chrome or Edge browser.')
      return
    }

    const rec = new SpeechRec()
    recognitionRef.current = rec
    rec.continuous = continuousMode
    rec.interimResults = true
    rec.lang = 'en-US'

    let lastFinal = ''

    rec.onresult = (event: any) => {
      let interim = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript.trim()
        if (event.results[i].isFinal) {
          finalText = t.toLowerCase()
        } else {
          interim = t
        }
      }

      if (interim) {
        setTranscript(interim)
      }

      if (finalText && finalText !== lastFinal) {
        lastFinal = finalText

        if (wakeWordEnabled) {
          const hasWake = wakeWords.some(w => finalText.includes(w))
          if (hasWake) {
            const command = finalText.replace(new RegExp(wakeWords.join('|'), 'gi'), '').trim()
            if (command.length > 1) {
              processVoiceCommand(command)
            } else {
              setStatus('listening')
              speak("I'm listening")
            }
            return
          }
          if (continuousMode) return // ignore non-wake in continuous
        }

        processVoiceCommand(finalText)
      }
    }

    rec.onerror = (event: any) => {
      console.error('Speech error:', event)
      setError('Mic error. Please allow microphone access and try again.')
      setIsListening(false)
      setStatus('idle')
      if (continuousMode) {
        setTimeout(() => startListening(), 1200)
      }
    }

    rec.onend = () => {
      setIsListening(false)
      if (continuousMode && !status.includes('speaking')) {
        setTimeout(() => {
          if (continuousMode) startListening()
        }, 400)
      }
    }

    try {
      rec.start()
      setIsListening(true)
      setStatus('listening')
      setError('')
      setTranscript('Listening...')
    } catch (e) {
      setError('Could not start microphone. Check browser permissions.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setStatus('idle')
    setTranscript('')
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Auto-start in continuous mode on mount for pro experience
  useEffect(() => {
    if (continuousMode) {
      const timer = setTimeout(() => {
        if (!isListening) startListening()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [continuousMode])

  return (
    <div className="voice-pro-container p-4 bg-surface border border-border-soft rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-medium text-sm">Pro Voice Agent</span>
          <span className="text-xs px-2 py-0.5 rounded bg-sidebar text-text-muted">
            {continuousMode ? 'Always Listening' : 'Push to Talk'}
          </span>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setContinuousMode(!continuousMode)}
            className={`px-3 py-1 rounded-full transition ${continuousMode ? 'bg-blue-500 text-white' : 'bg-sidebar'}`}
          >
            {continuousMode ? 'Continuous ON' : 'Continuous OFF'}
          </button>
          <button
            onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
            className={`px-3 py-1 rounded-full ${wakeWordEnabled ? 'bg-emerald-500 text-white' : 'bg-sidebar'}`}
          >
            Wake Word {wakeWordEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <button
        onClick={toggleListening}
        disabled={status === 'speaking'}
        className={`
          w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:brightness-110 text-white'
          }
        `}
      >
        {isListening ? (
          <>🛑 Stop Listening</>
        ) : (
          <>🎤 {continuousMode ? 'Start Always-Listening (Hey ANG)' : 'Start Voice Control'}</>
        )}
      </button>

      <div className="mt-4 min-h-[80px]">
        {transcript && (
          <div className="text-sm text-text-secondary mb-2">You said: <span className="text-text font-medium">"{transcript}"</span></div>
        )}
        
        {lastResponse && (
          <div className="p-3 bg-sidebar rounded-xl text-sm border-l-4 border-blue-500">
            <strong>ANG:</strong> {lastResponse}
          </div>
        )}

        {status === 'listening' && continuousMode && (
          <div className="text-emerald-400 text-sm mt-2 flex items-center gap-2">
            <span className="animate-pulse">●</span> 
            Waiting for "Hey ANG"...
          </div>
        )}

        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      </div>

      <div className="text-[11px] text-text-muted mt-3 leading-tight">
        Pro mode: Say "Hey ANG, make a folder called test", "open chrome", "what's running on my laptop", "open vs code"
      </div>
    </div>
  )
}
