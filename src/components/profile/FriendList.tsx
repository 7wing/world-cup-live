import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Friendship } from '@/types'

interface FriendListProps {
  friends: Friendship[]
}

export function FriendList({ friends }: FriendListProps) {
  const navigate = useNavigate()

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-lexend font-bold uppercase flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">group</span>
          Friends
        </h2>
        <span className="text-[10px] font-lexend font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full text-white/60">
          {friends.length} total
        </span>
      </div>

      <div className="space-y-2">
        {friends.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">No friends yet. Invite some fans!</p>
        ) : (
          friends.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => f.friend?.id && navigate(`/profile/${f.friend.id}`)}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer text-left"
            >
              <Avatar src={f.friend?.avatar_url ?? null} username={f.friend?.username ?? '?'} />
              <div className="flex-1 min-w-0">
                <p className="font-lexend font-semibold text-xs uppercase text-white truncate">
                  {f.friend?.username ?? '—'}
                </p>
                <p className="text-[10px] text-white/40 uppercase">{f.friend?.tier ?? '—'}</p>
              </div>
              <span className="material-symbols-outlined text-white/20 text-base shrink-0">
                arrow_forward
              </span>
            </button>
          ))
        )}
      </div>
    </GlassCard>
  )
}