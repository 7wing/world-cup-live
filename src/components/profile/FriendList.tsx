import { Avatar } from '@/components/ui/Avatar'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Friendship } from '@/types'

interface FriendListProps {
  friends: Friendship[]
}

export function FriendList({ friends }: FriendListProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-lexend font-bold uppercase flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">group</span>
          Friends
        </h2>
        <span className="text-[10px] font-lexend font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full text-white/60">
          {friends.filter(() => true).length} online
        </span>
      </div>
      <div className="space-y-2">
        {friends.map((f) => (
          <div key={f.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
            <Avatar src={f.friend?.avatar_url} username={f.friend?.username} online />
            <div className="flex-1">
              <p className="font-lexend font-semibold text-xs uppercase text-white">{f.friend?.username}</p>
              <p className="text-[10px] text-white/40 uppercase">{f.friend?.tier}</p>
            </div>
            <span className="text-[9px] font-lexend font-black text-primary-container">{f.friend?.tier?.toUpperCase()}</span>
          </div>
        ))}
        {friends.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">No friends yet. Invite some fans!</p>
        )}
      </div>
    </GlassCard>
  )
}