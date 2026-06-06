// src/pages/fanzone/WatchPartyPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 6: fully wired to Supabase chat_messages via useChatStore +
// useRealtimeMatch. No mock imports. Watch-party metadata derives from the
// matched Match row (name = "matchTeams watch party", score from match).
// Quick-react list is static UI chrome — not data, so stays inline.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChatStore }       from '@/store/chatStore'
import { useAuthStore }       from '@/store/authStore'
import { useRealtimeMatch }   from '@/hooks/useRealtime'
import { fetchChatMessages, sendChatMessage } from '@/api/fanzone'
import { useMatch }           from '@/hooks/useMatches'
import { Avatar }             from '@/components/ui/Avatar'
import { formatRelative }     from '@/utils/formatDate'
import type { ChatMessage }   from '@/types'

// Static UI chrome — these are emoji buttons, not data rows, so they live here.
const QUICK_REACTS = ['⚽', '🔥', '😱', '🎉', '👏', '💪', '😤', '❤️']

function nfmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

// LiveDot — inline so the file has no dependency on deleted fanzoneData.ts.
function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
    </span>
  )
}

export function WatchPartyPage() {
  const navigate           = useNavigate()
  // partyId doubles as matchId — watch parties are per-match chat rooms.
  const { partyId }        = useParams<{ partyId: string }>()
  const matchId            = partyId ?? ''

  const { user }           = useAuthStore()
  const { messages, setMessages, addMessage } = useChatStore()
  const [input, setInput]  = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [sending, setSending]         = useState(false)
  const bottomRef          = useRef<HTMLDivElement>(null)

  // Hydrate chat from Supabase on mount, then subscribe to new inserts.
  useRealtimeMatch(matchId)

  useEffect(() => {
    if (!matchId) return
    fetchChatMessages(matchId).then(msgs => setMessages(matchId, msgs))
  }, [matchId])

  // Scroll to bottom whenever messages update.
  const matchMessages: ChatMessage[] = messages[matchId] ?? []
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [matchMessages])

  // Pull match row for score display and party title.
  const { data: match } = useMatch(matchId)

  const partyName = match
    ? `${match.home_team.name} vs ${match.away_team.name} Watch Party`
    : 'Watch Party'

  const scoreDisplay = match && match.home_score != null && match.away_score != null
    ? `${match.home_team.code ?? match.home_team.name} ${match.home_score}–${match.away_score} ${match.away_team.code ?? match.away_team.name}`
    : null

  const statusLabel =
    match?.status === 'live'     ? `${match.minute}'` :
    match?.status === 'finished' ? 'FT' :
    null

  // ── Send helpers ──────────────────────────────────────────────────────────

  const doSend = async (content: string) => {
    const txt = content.trim()
    if (!txt || !user || sending) return

    // Optimistic insert so the message appears immediately.
    const optimistic: ChatMessage = {
      id:         `opt-${Date.now()}`,
      match_id:   matchId,
      user_id:    user.id,
      content:    txt,
      created_at: new Date().toISOString(),
      user:       { username: user.username, avatar_url: user.avatar_url },
    }
    addMessage(matchId, optimistic)
    setInput('')
    setSending(true)
    try {
      await sendChatMessage(matchId, user.id, txt)
    } finally {
      setSending(false)
    }
  }

  const handleSend    = () => doSend(input)
  const handleReact   = (emoji: string) => doSend(emoji)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px)', marginTop: 52 }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-black/95 flex-shrink-0">
        <button
          onClick={() => navigate('/fan-zone')}
          className="flex items-center gap-1.5 text-xs font-lexend font-bold text-white/30
                     hover:text-white/80 px-3 py-1.5 rounded-lg border border-white/10
                     bg-surface-container transition-colors cursor-pointer"
        >
          ‹ Fan Zone
        </button>

        <div className="w-px h-[22px] bg-white/10" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-lexend font-black text-white/90 truncate">
              {partyName}
            </h2>
            {match?.status === 'live' && (
              <div className="flex items-center gap-1.5 bg-primary-container/10 border
                              border-outline-variant rounded-[10px] px-2 py-0.5 flex-shrink-0">
                <LiveDot />
                <span className="font-lexend font-black text-[7px] uppercase tracking-widest
                                 text-primary-container">Live</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-lexend text-white/30 truncate">
            {nfmt(matchMessages.length)} messages
          </p>
        </div>

        {/* Score pill — only rendered when there is a real score */}
        {scoreDisplay && statusLabel && match && (
          <div className="bg-surface-container border border-white/10 rounded-[10px]
                          px-3.5 py-[5px] flex items-center gap-2.5 flex-shrink-0">
            <div className="text-center">
              <p className="text-[8px] font-lexend font-bold text-white/30 uppercase">
                {match.home_team.code ?? match.home_team.name}
              </p>
              <p className="text-lg font-lexend font-black text-primary-container leading-none">
                {match.home_score ?? '–'}
              </p>
            </div>
            <p className="text-[11px] font-lexend font-black text-white/20">–</p>
            <div className="text-center">
              <p className="text-[8px] font-lexend font-bold text-white/30 uppercase">
                {match.away_team.code ?? match.away_team.name}
              </p>
              <p className="text-lg font-lexend font-black text-white/50 leading-none">
                {match.away_score ?? '–'}
              </p>
            </div>
            <span className="font-lexend font-black text-[7px] uppercase tracking-widest
                             text-white/20 ml-1.5">{statusLabel}</span>
          </div>
        )}

        {/* Members toggle — hidden until we have a members API; left as UI stub */}
        <button
          onClick={() => setShowMembers(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-[7px] rounded-[10px] border text-xs
                      font-lexend font-bold flex-shrink-0 cursor-pointer transition-all ${
            showMembers
              ? 'border-outline-variant bg-primary-container/10 text-primary-container'
              : 'border-white/10 bg-surface-container text-white/30 hover:text-white/60'
          }`}
        >
          👥 Members
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 scrollbar-none">
            {matchMessages.length === 0 && (
              <p className="text-center text-white/20 text-sm font-lexend mt-8">
                No messages yet. Say something! ⚽
              </p>
            )}

            {matchMessages.map((msg, idx) => {
              const isOwn   = msg.user_id === user?.id
              const prevMsg = idx > 0 ? matchMessages[idx - 1] : null
              const grouped = prevMsg?.user_id === msg.user_id

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar — hidden when grouping consecutive messages from same user */}
                  <div className={`w-[30px] h-[30px] flex-shrink-0 ${grouped ? 'opacity-0' : 'opacity-100'}`}>
                    <Avatar
                      src={msg.user?.avatar_url ?? undefined}
                      username={msg.user?.username ?? '?'}
                      size="sm"
                    />
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[72%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!grouped && (
                      <p className={`text-[10px] font-lexend font-bold ${
                        isOwn ? 'text-primary-container' : 'text-white/30'
                      }`}>
                        {msg.user?.username ?? 'Fan'}
                      </p>
                    )}
                    <div
                      className={`px-3 py-2 border text-[13px] font-lexend leading-snug text-white/82 ${
                        isOwn
                          ? 'rounded-[12px_12px_2px_12px] bg-primary-container/10 border-outline-variant'
                          : 'rounded-[12px_12px_12px_2px] bg-surface-container-high border-white/5'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-lexend text-white/20">
                      {formatRelative(msg.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick reactions */}
          <div className="flex gap-1.5 px-5 pt-2 overflow-x-auto scrollbar-none">
            {QUICK_REACTS.map(r => (
              <button
                key={r}
                onClick={() => handleReact(r)}
                disabled={!user}
                className="text-xl px-2 py-1 rounded-lg border border-white/10 bg-surface-container
                           flex-shrink-0 cursor-pointer hover:scale-125 transition-transform
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2 px-5 py-4">
            {user ? (
              <>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Say something..."
                  className="flex-1 bg-surface-container border border-white/10 rounded-3xl
                             px-[18px] py-[11px] text-[13px] font-lexend text-white/80
                             placeholder:text-white/20 outline-none focus:border-outline-variant
                             transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-full bg-primary-container border-none text-lg
                             text-on-primary font-black flex-shrink-0
                             shadow-[0_0_16px_rgba(0,255,65,0.25)] cursor-pointer
                             hover:scale-110 transition-transform flex items-center justify-center
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
              </>
            ) : (
              <p className="flex-1 text-center text-white/30 text-xs font-lexend py-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary-container underline cursor-pointer"
                >
                  Sign in
                </button>{' '}
                to join the chat
              </p>
            )}
          </div>
        </div>

        {/* ── Members panel ────────────────────────────────────────────────── */}
        {/* Stub: members API not in schema yet — shows a placeholder */}
        {showMembers && (
          <div className="w-[220px] border-l border-white/10 bg-black/85 flex flex-col flex-shrink-0">
            <div className="px-4 py-3.5 border-b border-white/5">
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
                Members
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[11px] font-lexend text-white/20 text-center px-4">
                Member list coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}