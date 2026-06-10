// src/pages/fanzone/WatchPartyPage.tsx
// Watch party chat room — uses party_messages table, not chat_messages.

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams }      from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore }                from '@/store/authStore'
import { fetchWatchParties, fetchPartyMessages, sendPartyMessage } from '@/api/fanzone'
import { supabase }                   from '@/lib/supabase'
import { Avatar }                      from '@/components/ui/Avatar'
import { formatRelative }              from '@/utils/formatDate'
import type { PartyMessage, WatchParty } from '@/api/fanzone'

const QUICK_REACTS = ['⚽', '🔥', '😱', '🎉', '👏', '💪', '😤', '❤️']

function nfmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
    </span>
  )
}

export function WatchPartyPage() {
  const navigate              = useNavigate()
  const { partyId }           = useParams<{ partyId: string }>()
  const { user }              = useAuthStore()
  const queryClient           = useQueryClient()
  const [input, setInput]     = useState('')
  const [optimistic, setOptimistic] = useState<PartyMessage[]>([])
  const bottomRef             = useRef<HTMLDivElement>(null)

  // ── Fetch party metadata ──────────────────────────────────────────────────
  const { data: parties = [] } = useQuery({
    queryKey: ['watch_parties'],
    queryFn:  fetchWatchParties,
    staleTime: 30_000,
  })
  const party: WatchParty | undefined = parties.find(p => p.id === partyId)

  // ── Fetch messages ────────────────────────────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ['party_messages', partyId],
    queryFn:  () => fetchPartyMessages(partyId!),
    enabled:  !!partyId,
  })

  // ── Realtime subscription to party_messages ───────────────────────────────
  useEffect(() => {
    if (!partyId) return

    const channel = supabase.channel(`watch-party:${partyId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'party_messages',
        filter: `party_id=eq.${partyId}`,
      }, (payload) => {
        const newMsg = payload.new as PartyMessage & { user?: { username: string; avatar_url: string | null } }
        setOptimistic(prev => {
          // Deduplicate: don't add if already in messages or optimistic
          if (prev.find(m => m.id === newMsg.id) || messages.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId])

  // Merge DB messages with optimistic ones, deduplicate by id
  const allMessages = [
    ...messages,
    ...optimistic.filter(o => !messages.find(m => m.id === o.id)),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // ── Send message ──────────────────────────────────────────────────────────
  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: (content: string) => sendPartyMessage(partyId!, user!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party_messages', partyId] })
      queryClient.invalidateQueries({ queryKey: ['watch_parties'] })
    },
  })

  const doSend = useCallback((content: string) => {
    const txt = content.trim()
    if (!txt || !user || !partyId) return

    // Optimistic insert — id uses crypto.randomUUID() to avoid impure Date.now() in render
    const opt: PartyMessage = {
      id:         `${partyId}-${crypto.randomUUID()}`,
      party_id:   partyId,
      user_id:    user.id,
      content:    txt,
      created_at: new Date().toISOString(),
      user:       { username: user.username, avatar_url: user.avatar_url },
    }
    setOptimistic(prev => [...prev, opt])
    setInput('')
    send(txt)
  }, [user, partyId, send])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) doSend(input)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px)', marginTop: 52 }}>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-black/95 flex-shrink-0">
        <button
          onClick={() => navigate('/fan-zone')}
          className="flex items-center gap-1.5 text-xs font-lexend font-bold text-white/30 hover:text-white/80 px-3 py-1.5 rounded-lg border border-white/10 bg-surface-container transition-colors cursor-pointer"
        >
          ‹ Fan Zone
        </button>

        <div className="w-px h-[22px] bg-white/10" />

        <div className="flex-1 min-w-0">
          {party ? (
            <div className="flex items-center gap-2">
              <span className="text-xl">{party.flag}</span>
              <div>
                <h2 className="text-[15px] font-lexend font-black text-white/90 truncate">
                  {party.name}
                </h2>
                <p className="text-[10px] font-lexend text-white/30">
                  {nfmt(allMessages.length)} messages · {party.viewer_count.toLocaleString()} watching
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-primary-container/10 border border-outline-variant rounded-[10px] px-2 py-0.5 flex-shrink-0">
                <LiveDot />
                <span className="font-lexend font-black text-[7px] uppercase tracking-widest text-primary-container">Live</span>
              </div>
            </div>
          ) : (
            <div className="h-5 w-48 bg-white/5 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 scrollbar-none">
        {allMessages.length === 0 && (
          <p className="text-center text-white/20 text-sm font-lexend mt-8">
            No messages yet. Say something! ⚽
          </p>
        )}

        {allMessages.map((msg, idx) => {
          const isOwn   = msg.user_id === user?.id
          const prevMsg = idx > 0 ? allMessages[idx - 1] : null
          const grouped = prevMsg?.user_id === msg.user_id

          return (
            <div
              key={msg.id}
              className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-[30px] h-[30px] flex-shrink-0 ${grouped ? 'opacity-0' : 'opacity-100'}`}>
                <Avatar
                  src={msg.user?.avatar_url ?? undefined}
                  username={msg.user?.username ?? '?'}
                  size="sm"
                />
              </div>

              <div className={`max-w-[72%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!grouped && (
                  <p className={`text-[10px] font-lexend font-bold ${isOwn ? 'text-primary-container' : 'text-white/30'}`}>
                    {msg.user?.username ?? 'Fan'}
                  </p>
                )}
                <div
                  className={`px-3 py-2 border text-[13px] font-lexend leading-snug text-white/80 ${
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

      {/* Quick reacts */}
      <div className="flex gap-1.5 px-5 pt-2 overflow-x-auto scrollbar-none flex-shrink-0">
        {QUICK_REACTS.map(r => (
          <button
            key={r}
            onClick={() => doSend(r)}
            disabled={!user}
            className="text-xl px-2 py-1 rounded-lg border border-white/10 bg-surface-container flex-shrink-0 cursor-pointer hover:scale-125 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-5 py-4 flex-shrink-0">
        {user ? (
          <>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              className="flex-1 bg-surface-container border border-white/10 rounded-3xl px-[18px] py-[11px] text-[13px] font-lexend text-white/80 placeholder:text-white/20 outline-none focus:border-outline-variant transition-colors"
            />
            <button
              onClick={() => doSend(input)}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-full bg-primary-container text-on-primary font-black flex-shrink-0 shadow-[0_0_16px_rgba(0,255,65,0.25)] cursor-pointer hover:scale-110 transition-transform flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
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
  )
}