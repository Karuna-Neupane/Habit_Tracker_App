// AIChatBot — Premium feature alongside the Week 7 AI Coach
//
// A fully functional chat interface for natural-language follow-up questions
// about the user's habits. Conversation history is persisted server-side
// (MongoDB, via /api/ai/chat/history) so it survives refresh and re-login —
// this component just loads it once on mount and appends to it locally as
// new turns come in.

import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Send, Sparkles, Trash2, User } from 'lucide-react'
import api from '../utils/api.js'
import ConfirmDialog from './ConfirmDialog.jsx'

const SUGGESTED_QUESTIONS = [
  'How am I doing overall this week?',
  'Which habit needs the most attention?',
  'Give me a tip for my weakest habit',
  "What should tomorrow's goal be?",
]

function formatTime(dateLike) {
  try {
    return new Date(dateLike).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-ember text-white' : 'bg-pine text-white'
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" aria-hidden="true" /> : <Bot className="h-3.5 w-3.5" aria-hidden="true" />}
      </div>
      <div className={`flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-br-sm bg-ember text-white'
              : 'rounded-bl-sm border border-paperLine bg-white text-ink'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="mt-1 px-1 text-[11px] text-inkSoft">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pine text-white">
        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-paperLine bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-inkSoft/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AIChatBot() {
  const [messages, setMessages]         = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput]               = useState('')
  const [sending, setSending]           = useState(false)
  const [error, setError]               = useState('')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const scrollRef = useRef(null)
  const inputRef  = useRef(null)

  // Load previous conversation once on mount so chats survive refresh/login.
  useEffect(() => {
    let cancelled = false
    async function loadHistory() {
      try {
        setLoadingHistory(true)
        const { data } = await api.get('/ai/chat/history')
        if (!cancelled) setMessages(data.messages || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load your previous conversation.')
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }
    loadHistory()
    return () => { cancelled = true }
  }, [])

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setError('')
    setInput('')
    setSending(true)

    // Optimistic bubble so the UI feels instant; replaced/reconciled once
    // the server confirms with its own id + timestamp.
    const optimisticId = `optimistic-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: 'user', content: trimmed, createdAt: new Date().toISOString() },
    ])

    try {
      const { data } = await api.post('/ai/chat', { message: trimmed })
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        data.userMessage,
        data.reply,
      ])
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't reach your AI coach. Please try again.")
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setInput(trimmed) // give the message back so nothing is lost
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  async function handleClearHistory() {
    setConfirmClearOpen(false)
    try {
      await api.delete('/ai/chat/history')
      setMessages([])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not clear the conversation.')
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pineSoft text-pine">
            <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-pine">Premium feature</p>
            <h2 className="font-display text-xl font-bold text-ink">Ask your AI Coach</h2>
          </div>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-paperLine bg-white/70 px-3 py-1.5 text-xs font-semibold text-inkSoft transition-colors hover:bg-white hover:text-ember"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear chat
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-paperLine bg-white/60 shadow-sm">
        {/* ── Message list ────────────────────────────────────────────── */}
        <div ref={scrollRef} className="h-[26rem] space-y-4 overflow-y-auto px-4 py-5 sm:h-[30rem]">
          {loadingHistory && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-2/3 animate-pulse rounded-2xl bg-paperLine" style={{ marginLeft: i % 2 ? 'auto' : 0 }} />
              ))}
            </div>
          )}

          {!loadingHistory && !hasMessages && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pineSoft text-pine">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="font-display text-sm font-semibold text-ink">Ask me anything about your habits</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-inkSoft">
                I can see your real streaks and completion rates — ask a follow-up question or try a suggestion below.
              </p>
            </div>
          )}

          {!loadingHistory && messages.map((m) => <MessageBubble key={m.id} message={m} />)}
          {sending && <TypingIndicator />}
        </div>

        {/* ── Suggested questions ─────────────────────────────────────── */}
        {!loadingHistory && (
          <div className="flex flex-wrap gap-2 border-t border-paperLine bg-paper/60 px-4 py-3">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={sending}
                className="rounded-full border border-paperLine bg-white px-3 py-1.5 text-xs font-medium text-inkSoft transition-colors hover:border-pine/40 hover:text-pine disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────────────── */}
        {error && (
          <div className="border-t border-ember/20 bg-emberSoft px-4 py-2 text-xs text-ember">{error}</div>
        )}

        {/* ── Composer ─────────────────────────────────────────────────── */}
        <div className="flex items-end gap-2 border-t border-paperLine bg-white p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your habits… (Enter to send, Shift+Enter for a new line)"
            rows={1}
            disabled={sending || loadingHistory}
            className="max-h-28 flex-1 resize-none rounded-xl border border-paperLine bg-paper/50 px-3 py-2.5 text-sm text-ink placeholder:text-inkSoft/70 focus:border-pine focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={sending || loadingHistory || !input.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine text-white transition-colors hover:bg-pine/90 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear conversation?"
        message="This permanently deletes your saved AI chat history. This can't be undone."
        confirmLabel="Clear chat"
        danger
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  )
}
