// src/pages/fanzone/WatchPartyPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// No props needed — party resolved via useParams, back via useNavigate.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LiveDot } from '@/components/ui/ui'
import { CHAT_INIT, WATCH_MEMBERS, WATCH_PARTIES, QUICK_REACTS } from '@/lib/fanzoneData'
import type { ChatMessage } from '@/lib/fanzoneData'

function nfmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function WatchPartyPage() {
  const navigate = useNavigate()
  const { partyId } = useParams()

  const p = WATCH_PARTIES.find((wp) => wp.id === partyId) ?? WATCH_PARTIES[0]
  const onlineCount = WATCH_MEMBERS.filter((m) => m.online).length

  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_INIT)
  const [input, setInput] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (content?: string) => {
    const txt = (content ?? input).trim()
    if (!txt) return
    setMessages((prev) => [
      ...prev,
      { id: `c${Date.now()}`, user: 'You', avatar: '🌟', content: txt, time: 'Now', own: true },
    ])
    setInput('')
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px)', marginTop: 52 }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-black/95 flex-shrink-0">
        <button
          onClick={() => navigate('/fan-zone')}
          className="flex items-center gap-1.5 text-xs font-lexend font-bold text-white/30 hover:text-white/80 px-3 py-1.5 rounded-lg border border-white/10 bg-surface-container transition-colors cursor-pointer"
        >
          ‹ Fan Zone
        </button>

        <div className="w-px h-[22px] bg-white/10" />

        <span className="text-[22px]">{p.flag}</span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-lexend font-black text-white/90">{p.name}</h2>
            <div className="flex items-center gap-1.5 bg-primary-container/10 border border-outline-variant rounded-[10px] px-2 py-0.5">
              <LiveDot />
              <span className="font-lexend font-black text-[7px] uppercase tracking-widest text-primary-container">
                Live
              </span>
            </div>
          </div>
          <p className="text-[10px] font-lexend text-white/30">
            Hosted by {p.host} · {nfmt(p.viewers)} watching
          </p>
        </div>

        {/* Score pill */}
        <div className="bg-surface-container border border-white/10 rounded-[10px] px-3.5 py-[5px] flex items-center gap-2.5 flex-shrink-0">
          <div className="text-center">
            <p className="text-[8px] font-lexend font-bold text-white/30 uppercase">BRA</p>
            <p className="text-lg font-lexend font-black text-primary-container leading-none">2</p>
          </div>
          <p className="text-[11px] font-lexend font-black text-white/20">–</p>
          <div className="text-center">
            <p className="text-[8px] font-lexend font-bold text-white/30 uppercase">GER</p>
            <p className="text-lg font-lexend font-black text-white/50 leading-none">0</p>
          </div>
          <span className="font-lexend font-black text-[7px] uppercase tracking-widest text-white/20 ml-1.5">
            HT
          </span>
        </div>

        {/* Members toggle */}
        <button
          onClick={() => setShowMembers((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-[7px] rounded-[10px] border text-xs font-lexend font-bold flex-shrink-0 cursor-pointer transition-all ${
            showMembers
              ? 'border-outline-variant bg-primary-container/10 text-primary-container'
              : 'border-white/10 bg-surface-container text-white/30 hover:text-white/60'
          }`}
        >
          👥 {onlineCount} online
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 scrollbar-none">
            {/* HT divider */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex-1 h-px bg-white/5" />
              <span className="font-lexend font-black text-[8px] uppercase tracking-widest text-white/20">
                HT · Brazil 2–0 Germany
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {messages.map((msg, idx) => {
              const prevOwn = idx > 0 && messages[idx - 1].own === msg.own
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-end ${msg.own ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-[30px] h-[30px] rounded-full bg-surface-container-high flex items-center justify-center text-sm flex-shrink-0 ${prevOwn ? 'opacity-0' : 'opacity-100'}`}
                  >
                    {msg.avatar}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[72%] flex flex-col gap-0.5 ${msg.own ? 'items-end' : 'items-start'}`}>
                    {!prevOwn && (
                      <p className={`text-[10px] font-lexend font-bold ${msg.own ? 'text-primary-container' : 'text-white/30'}`}>
                        {msg.user}
                      </p>
                    )}
                    <div
                      className={`px-3 py-2 border text-[13px] font-lexend leading-snug text-white/82 ${
                        msg.own
                          ? 'rounded-[12px_12px_2px_12px] bg-primary-container/10 border-outline-variant'
                          : 'rounded-[12px_12px_12px_2px] bg-surface-container-high border-white/5'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-lexend text-white/20">{msg.time}</span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick reactions */}
          <div className="flex gap-1.5 px-5 pt-2 overflow-x-auto scrollbar-none">
            {QUICK_REACTS.map((r) => (
              <button
                key={r}
                onClick={() => send(r)}
                className="text-xl px-2 py-1 rounded-lg border border-white/10 bg-surface-container flex-shrink-0 cursor-pointer hover:scale-125 transition-transform"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2 px-5 py-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Say something..."
              className="flex-1 bg-surface-container border border-white/10 rounded-3xl px-[18px] py-[11px] text-[13px] font-lexend text-white/80 placeholder:text-white/20 outline-none focus:border-outline-variant transition-colors"
            />
            <button
              onClick={() => send()}
              className="w-11 h-11 rounded-full bg-primary-container border-none text-lg text-on-primary font-black flex-shrink-0 shadow-[0_0_16px_rgba(0,255,65,0.25)] cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
            >
              ↑
            </button>
          </div>
        </div>

        {/* ── Members panel ────────────────────────────────────────────────── */}
        {showMembers && (
          <div className="w-[220px] border-l border-white/10 bg-black/85 flex flex-col flex-shrink-0">
            <div className="px-4 py-3.5 border-b border-white/5">
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
                Members · {WATCH_MEMBERS.length}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto py-2.5 scrollbar-none">
              {/* Online */}
              <p className="font-lexend font-black text-[8px] uppercase tracking-widest text-white/20 px-4 pt-1 pb-2">
                Online — {onlineCount}
              </p>
              {WATCH_MEMBERS.filter((m) => m.online).map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 px-4 py-[7px]">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[13px]">
                      {m.avatar}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary-container border-2 border-surface" />
                  </div>
                  <p className="text-[11px] font-lexend font-semibold text-white/60">{m.name}</p>
                </div>
              ))}

              {/* Offline */}
              <p className="font-lexend font-black text-[8px] uppercase tracking-widest text-white/20 px-4 pt-3 pb-2">
                Offline
              </p>
              {WATCH_MEMBERS.filter((m) => !m.online).map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 px-4 py-[7px] opacity-40">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[13px]">
                    {m.avatar}
                  </div>
                  <p className="text-[11px] font-lexend font-semibold text-white/30">{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}