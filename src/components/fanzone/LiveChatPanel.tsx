import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { useRealtimeMatch } from '@/hooks/useRealtime'
import { sendChatMessage, fetchChatMessages } from '@/api/fanzone'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/formatDate'

interface LiveChatPanelProps {
  matchId: string
}

export function LiveChatPanel({ matchId }: LiveChatPanelProps) {
  const { messages, setMessages, addMessage } = useChatStore()
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  useRealtimeMatch(matchId)
  const matchMessages = messages[matchId] ?? []

  useEffect(() => {
    fetchChatMessages(matchId).then((msgs) => setMessages(matchId, msgs))
  }, [matchId, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [matchMessages.length])

  const handleSend = async () => {
    if (!input.trim() || !user) return
    const optimistic = {
      id: crypto.randomUUID(),
      match_id: matchId,
      user_id: user.id,
      content: input,
      created_at: new Date().toISOString(),
      user: { username: user.username, avatar_url: user.avatar_url },
    }
    addMessage(matchId, optimistic)
    setInput('')
    await sendChatMessage(matchId, user.id, optimistic.content)
  }


  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">campaign</span>
          <h3 className="font-lexend font-bold uppercase text-sm">Live Chat</h3>
        </div>
        <span className="text-[10px] font-bold text-primary-container bg-primary-container/20 px-2 py-0.5 rounded uppercase">
          {matchMessages.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {matchMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
            <Avatar src={msg.user?.avatar_url} username={msg.user?.username} size="sm" />
            <div className={`max-w-[80%] p-3 rounded-xl ${msg.user_id === user?.id ? 'bg-primary-container/10 border border-primary-container/20 rounded-tr-none' : 'bg-white/5 border border-white/5 rounded-tl-none'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-[10px] font-lexend font-semibold text-primary-container">{msg.user?.username}</p>
                <span className="text-[9px] text-white/30">{formatRelative(msg.created_at)}</span>
              </div>
              <p className="text-sm text-white/80">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-black/80 border-t border-white/10">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-primary-container/50 text-white placeholder:text-white/20"
            placeholder="Say something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 bg-primary-container text-on-primary rounded-full flex items-center justify-center active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}