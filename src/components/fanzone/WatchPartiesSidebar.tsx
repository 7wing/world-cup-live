// src/components/fanzone/WatchPartiesSidebar.tsx

import { useState, useRef, useEffect, useCallback }  from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LiveDot }           from '@/components/ui/LiveDot'
import { NeonButton }        from '@/components/ui/NeonButton'
import { Avatar }            from '@/components/ui/Avatar'
import { fetchWatchParties, createWatchParty, fetchPartyMessages, sendPartyMessage } from '@/api/fanzone'
import { useAuthStore }      from '@/store/authStore'
import { formatRelative }    from '@/utils/formatDate'
import { supabase }          from '@/lib/supabase'
import type { WatchParty, PartyMessage } from '@/api/fanzone'

const FLAG_OPTIONS = ['🌍', '🏟️', '⚽', '🔥', '🇧🇷', '🇦🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🏴󠁧󠁢󠁥󠁮󠁧󠁿']

const QUICK_REACTS = ['⚽', '🔥', '😱', '🎉', '👏', '💪', '😤', '❤️']

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

// ─── Party Chat Modal ─────────────────────────────────────────────────────────

interface PartyChatModalProps {
  party:   WatchParty
  onClose: () => void
}

function PartyChatModal({ party, onClose }: PartyChatModalProps) {
  const { user }        = useAuthStore()
  const queryClient     = useQueryClient()
  const [input, setInput]           = useState('')
  const [optimistic, setOptimistic] = useState<PartyMessage[]>([])
  const bottomRef                   = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery({
    queryKey: ['party_messages', party.id],
    queryFn:  () => fetchPartyMessages(party.id),
  })

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel(`watch-party-modal:${party.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'party_messages',
        filter: `party_id=eq.${party.id}`,
      }, (payload) => {
        const newMsg = payload.new as PartyMessage
        setOptimistic(prev => {
          if (prev.find(m => m.id === newMsg.id) || messages.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party.id])

  const allMessages = [
    ...messages,
    ...optimistic.filter(o => !messages.find((m: PartyMessage) => m.id === o.id)),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: (content: string) => sendPartyMessage(party.id, user!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party_messages', party.id] })
      queryClient.invalidateQueries({ queryKey: ['watch_parties'] })
    },
  })

  const doSend = useCallback((content: string) => {
    const txt = content.trim()
    if (!txt || !user) return
    const opt: PartyMessage = {
      id:         `${party.id}-${crypto.randomUUID()}`,
      party_id:   party.id,
      user_id:    user.id,
      content:    txt,
      created_at: new Date().toISOString(),
      user:       { username: user.username, avatar_url: user.avatar_url },
    }
    setOptimistic(prev => [...prev, opt])
    setInput('')
    send(txt)
  }, [party, user, send])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] glass-card rounded-2xl overflow-hidden flex flex-col"
        style={{ height: '70vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{party.flag}</span>
            <div>
              <p className="font-lexend font-black text-sm text-white/80">{party.name}</p>
              <p className="text-[10px] font-lexend text-white/30">
                {party.viewer_count.toLocaleString()} watching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 min-h-0 scrollbar-none">
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
              <div key={msg.id} className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-[28px] h-[28px] flex-shrink-0 ${grouped ? 'opacity-0' : 'opacity-100'}`}>
                  <Avatar src={msg.user?.avatar_url ?? undefined} username={msg.user?.username ?? '?'} size="sm" />
                </div>
                <div className={`max-w-[75%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!grouped && (
                    <p className={`text-[10px] font-lexend font-bold ${isOwn ? 'text-primary-container' : 'text-white/30'}`}>
                      {msg.user?.username ?? 'Fan'}
                    </p>
                  )}
                  <div className={`px-3 py-2 border text-[13px] font-lexend leading-snug text-white/80 ${
                    isOwn
                      ? 'rounded-[12px_12px_2px_12px] bg-primary-container/10 border-outline-variant'
                      : 'rounded-[12px_12px_12px_2px] bg-surface-container-high border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-lexend text-white/20">{formatRelative(msg.created_at)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick reacts */}
        <div className="flex gap-1.5 px-4 pt-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {QUICK_REACTS.map(r => (
            <button
              key={r}
              onClick={() => doSend(r)}
              disabled={!user}
              className="text-lg px-2 py-1 rounded-lg border border-white/10 bg-surface-container flex-shrink-0 cursor-pointer hover:scale-125 transition-transform disabled:opacity-30"
            >
              {r}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-white/5 flex-shrink-0">
          {user ? (
            <>
              <input
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSend(input)}
                placeholder="Say something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none focus:border-primary-container/50 transition-colors"
              />
              <button
                onClick={() => doSend(input)}
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm text-on-primary">send</span>
              </button>
            </>
          ) : (
            <p className="flex-1 text-center text-white/30 text-xs font-lexend py-2">
              Sign in to chat
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Party Row ────────────────────────────────────────────────────────────────

interface PartyRowProps {
  party:   WatchParty
  onEnter: (party: WatchParty) => void
}

function PartyRow({ party, onEnter }: PartyRowProps) {
  return (
    <button
      onClick={() => onEnter(party)}
      className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors bg-transparent cursor-pointer"
    >
      <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-lg flex-shrink-0">
        {party.flag}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-lexend font-bold text-white/80 truncate">{party.name}</p>
        {party.last_message && (
          <p className="text-[11px] font-lexend text-white/40 truncate">{party.last_message}</p>
        )}
        <p className="text-[10px] font-lexend text-white/20 mt-0.5">
          {party.viewer_count.toLocaleString()} watching
          {party.last_msg_at ? ` · ${timeAgo(party.last_msg_at)} ago` : ''}
        </p>
      </div>
      <span className="text-base text-white/20">›</span>
    </button>
  )
}

// ─── Create Party Modal ───────────────────────────────────────────────────────

interface CreatePartyModalProps {
  onClose: () => void
}

function CreatePartyModal({ onClose }: CreatePartyModalProps) {
  const { user }       = useAuthStore()
  const queryClient    = useQueryClient()
  const [name, setName]           = useState('')
  const [flag, setFlag]           = useState('🌍')
  const [formError, setFormError] = useState<string | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: createWatchParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch_parties'] })
      onClose()
    },
    onError: (err) => {
      console.error('[CreatePartyModal] error:', err)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('already exists')) {
        setFormError('A party with this name already exists.')
      } else {
        setFormError('Failed to create party. Please try again.')
      }
    },
  })

  const handleSubmit = () => {
    if (!name.trim()) { setFormError('Give your party a name.'); return }
    if (!user)        { setFormError('You need to be signed in.'); return }
    setFormError(null)
    mutate({ name: name.trim(), flag, match_id: null, created_by: user.id })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[10px] flex items-center justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] glass-card rounded-2xl p-5 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-lexend font-black text-sm uppercase tracking-widest text-white/80">
            Create Watch Party
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">Party Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            maxLength={60}
            placeholder="e.g. Brazilian Boys Watch Party 🇧🇷"
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">Icon</label>
          <div className="flex flex-wrap gap-2">
            {FLAG_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlag(f)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                  flag === f
                    ? 'border-primary-container bg-primary-container/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {formError && <p className="text-red-400 text-[11px] font-lexend">{formError}</p>}

        <div className="flex gap-2 pt-1">
          <NeonButton variant="outline" className="flex-1 justify-center text-[10px] py-2" onClick={onClose}>
            Cancel
          </NeonButton>
          <NeonButton
            className="flex-1 justify-center text-[10px] py-2"
            disabled={!name.trim() || isPending}
            onClick={handleSubmit}
          >
            {isPending ? 'Creating...' : 'Create Party'}
          </NeonButton>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function WatchPartiesSidebar() {
  const [showCreate, setShowCreate]   = useState(false)
  const [activeParty, setActiveParty] = useState<WatchParty | null>(null)

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ['watch_parties'],
    queryFn:  fetchWatchParties,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <LiveDot />
            <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
              Watch Parties
            </span>
          </div>
          <span className="font-lexend font-black text-[10px] uppercase tracking-widest text-primary-container">
            {isLoading ? '—' : `${parties.length} Live`}
          </span>
        </div>

        {isLoading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && parties.map(p => (
          <PartyRow key={p.id} party={p} onEnter={setActiveParty} />
        ))}

        {!isLoading && parties.length === 0 && (
          <p className="text-[10px] font-lexend text-white/20 text-center py-6">
            No watch parties yet — start one!
          </p>
        )}

        <div className="px-4 py-2.5 border-t border-white/5">
          <NeonButton
            variant="outline"
            className="w-full justify-center text-[10px] py-1.5"
            onClick={() => setShowCreate(true)}
          >
            Create a Party
          </NeonButton>
        </div>
      </div>

      {showCreate  && <CreatePartyModal onClose={() => setShowCreate(false)} />}
      {activeParty && <PartyChatModal party={activeParty} onClose={() => setActiveParty(null)} />}
    </>
  )
}