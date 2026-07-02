import { useEffect, useRef, useState } from 'react'
import { agentChat } from '../api/client'
import { useLot } from '../context/LotContext'
import { Icon } from '../components/Icon'
import { LotSelector } from '../components/LotSelector'

type Message = { role: 'user' | 'agent'; text: string }

const SUGGESTIONS = [
  'Trace LOT-2026-0421 and summarize compliance',
  'Check cold chain status for LOT-2026-0315',
  'Why is recall blocked for LOT-2026-0199?',
  'List all batches and flag any risks',
]

export default function AgentPage() {
  const { lot } = useLot()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(`Trace batch ${lot} and summarize compliance`)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput(`Trace batch ${lot} and summarize compliance`)
  }, [lot])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const reply = await agentChat(msg, lot)
      setMessages((m) => [...m, { role: 'agent', text: reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e}` }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="smart_toy" className="text-primary" />
          TraceFork AI Agent
        </h2>
        <p className="text-sm text-text-muted mt-1 flex flex-wrap items-center gap-2">
          Gemini 2.0 Flash · Tool calling on live Firestore · Context lot:
          <LotSelector className="py-1 text-xs" />
        </p>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-border-subtle flex flex-col overflow-hidden mb-4">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Icon name="psychology" className="text-primary mx-auto mb-4" size={48} />
              <p className="text-text-muted text-sm max-w-md mx-auto">
                Ask about traces, cold chain violations, recall impact, or integrity checks. The
                agent uses real Firestore data via tool calling.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-2 rounded-full border border-border-subtle hover:border-primary hover:text-primary transition text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-surface-dim rounded-br-md'
                    : 'bg-surface-container-high border border-border-subtle rounded-bl-md'
                }`}
              >
                {m.role === 'agent' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-primary font-mono mb-2">
                    <Icon name="smart_toy" size={14} />
                    TraceFork Agent
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-high border border-border-subtle rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-text-muted">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                Running tools…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-border-subtle bg-surface-container/50">
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[48px] max-h-32 bg-surface-dim border border-border-subtle rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask about a batch, recall, or compliance…"
              rows={1}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-primary text-surface-dim font-bold px-4 rounded-xl disabled:opacity-40 hover:brightness-110 transition shrink-0 self-end h-12 flex items-center justify-center"
            >
              <Icon name="send" size={22} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
