import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  fetchConversations,
  fetchDirectMessages,
  sendDirectMessage,
  markDmRead,
} from '@/api/profile'
import type { DirectMessage, Conversation } from '@/types'
import { cn } from '@/utils/cn'

// ── Conversation list item ────────────────────────────────────────────────────
function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation
  isActive: boolean
  onClick: () => void
}) {
  const last = conv.last_message
  const preview = last?.content?.slice(0, 50) ?? ''
  const timeAgo = last?.created_at
    ? formatTimeAgo(new Date(last.created_at))
    : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors',
        isActive
          ? 'bg-primary-container/10 border border-primary-container/30'
          : 'border border-transparent hover:bg-white/[0.04]'
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          src={conv.partner.avatar_url}
          username={conv.partner.username}
          size="md"
        />
        {conv.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container rounded-full border border-black flex items-center justify-center">
            <span className="font-lexend font-black text-[9px] text-on-primary">
              {conv.unread_count > 9 ? '9+' : conv.unread_count}
            </span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'font-lexend font-black text-xs uppercase truncate',
            conv.unread_count > 0 ? 'text-white' : 'text-white/70'
          )}>
            {conv.partner.username}
          </p>
          {timeAgo && (
            <span className="text-[9px] text-white/30 font-lexend shrink-0">
              {timeAgo}
            </span>
          )}
        </div>
        <p className={cn(
          'text-[11px] font-lexend mt-0.5 truncate',
          conv.unread_count > 0 ? 'text-white/60' : 'text-white/30'
        )}>
          {preview}{last && last.content && last.content.length > 50 ? '…' : ''}
        </p>
      </div>
    </button>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  dm,
  isMine,
}: {
  dm: DirectMessage
  isMine: boolean
}) {
  const time = dm.created_at ? new Date(dm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className={cn('flex gap-2 mb-3', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {!isMine && (
        <Avatar
          src={(dm.sender as { avatar_url?: string | null })?.avatar_url ?? null}
          username={(dm.sender as { username?: string })?.username}
          size="sm"
          className="w-7 h-7 shrink-0 mt-0.5"
        />
      )}

      <div className={cn('max-w-[75%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm font-lexend leading-relaxed',
            isMine
              ? 'bg-primary-container text-on-primary rounded-br-sm'
              : 'bg-white/10 text-white/90 rounded-bl-sm'
          )}
        >
          {dm.content}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] text-white/20 font-lexend">{time}</span>
          {isMine && dm.read_at && (
            <span className="material-symbols-outlined text-[10px] text-primary-container">
              done_all
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function MessagesPage() {
  const { userId: activePartnerId } = useParams<{ userId?: string }>()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    data: conversations = [],
    isLoading: convsLoading,
    refetch: refetchConvs,
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
  })

  const {
    data: messages = [],
    isLoading: msgsLoading,
    refetch: refetchMsgs,
  } = useQuery({
    queryKey: ['direct_messages', user?.id, activePartnerId],
    queryFn: () => fetchDirectMessages(user!.id, activePartnerId!),
    enabled: !!user && !!activePartnerId,
  })

  const sendMutation = useMutation({
    mutationFn: () => sendDirectMessage(user!.id, activePartnerId!, draft.trim()),
    onSuccess: () => {
      setDraft('')
      refetchMsgs()
      refetchConvs()
    },
  })

  // Supabase Realtime subscription for incoming DMs
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('dm-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          qc.invalidateQueries({ queryKey: ['conversations'] })
          qc.invalidateQueries({ queryKey: ['direct_messages'] })
          // Mark as read automatically
          const dm = payload.new as DirectMessage
          if (dm.id) markDmRead(dm.id).catch(() => {})
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, qc, user])

  // Auto-select first conversation
  useEffect(() => {
    if (!activePartnerId && conversations.length > 0) {
      const first = conversations[0]
      if (first) navigate(`/messages/${first.partner_id}`, { replace: true })
    }
  }, [conversations, activePartnerId, navigate])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!activePartnerId || !user) return
    const unread = messages.filter(
      (m) => m.sender_id === activePartnerId && !m.read_at
    )
    unread.forEach((m) => markDmRead(m.id).catch(() => {}))
  }, [activePartnerId, user?.id, messages, user])

  const activePartner = conversations.find((c) => c.partner_id === activePartnerId)?.partner

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-white/20">chat</span>
          <p className="font-lexend font-bold uppercase text-white/40">Sign in to message</p>
          <NeonButton size="sm" onClick={() => navigate('/login')}>Sign In</NeonButton>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <h1 className="font-lexend font-black text-4xl uppercase italic mb-6">Messages</h1>

      <GlassCard className="p-0 flex overflow-hidden" style={{ minHeight: 520 }}>
        {/* ── Conversation list ── */}
        <div
          className="w-full md:w-72 shrink-0 flex flex-col overflow-y-auto border-r border-white/8"
          style={{ maxHeight: 520 }}
        >
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
              <span className="material-symbols-outlined text-5xl text-white/15">forum</span>
              <p className="font-lexend font-bold uppercase text-white/30 text-sm">
                No conversations yet
              </p>
              <p className="text-xs text-white/20 font-lexend">
                Add friends and send a message to start chatting
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.partner_id}
                  conv={conv}
                  isActive={conv.partner_id === activePartnerId}
                  onClick={() => navigate(`/messages/${conv.partner_id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thread panel ── */}
        <div className="flex-1 flex flex-col" style={{ minHeight: 520 }}>
          {!activePartnerId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <span className="material-symbols-outlined text-6xl text-white/10">chat</span>
              <p className="font-lexend font-bold uppercase text-white/25 text-sm">
                Select a conversation
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 shrink-0">
                <Avatar
                  src={activePartner?.avatar_url}
                  username={activePartner?.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-lexend font-black text-xs uppercase truncate">
                    {activePartner?.username ?? '—'}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${activePartnerId}`)}
                  className="text-white/30 hover:text-primary-container transition-colors"
                  aria-label="View profile"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {msgsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse w-3/4" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10">chat_bubble_outline</span>
                    <p className="font-lexend font-bold uppercase text-white/20 text-xs">
                      No messages yet
                    </p>
                    <p className="text-[10px] text-white/15 font-lexend max-w-xs">
                      Say hello to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((dm) => (
                    <MessageBubble
                      key={dm.id}
                      dm={dm}
                      isMine={dm.sender_id === user.id}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-white/8 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                      e.preventDefault()
                      sendMutation.mutate()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl font-lexend text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary-container/50 transition-colors"
                />
                <NeonButton
                  size="sm"
                  disabled={!draft.trim() || sendMutation.isPending}
                  onClick={() => sendMutation.mutate()}
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </NeonButton>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </PageWrapper>
  )
}