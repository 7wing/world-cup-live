import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useQuery } from '@tanstack/react-query'
import { fetchTribeById, fetchTribeMembers } from '@/api/fanzone'
import { useAuthStore } from '@/store/authStore'
import { useJoinTribe, useLeaveTribe } from '@/hooks/useTribes'
import { cn } from '@/utils/cn'

export function TribeDetailPage() {
  const { tribeId } = useParams<{ tribeId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { joinMutation, isJoining } = useJoinTribe()
  const { leaveMutation, isLeaving } = useLeaveTribe()

  const { data: tribe, isLoading: tribeLoading, error: tribeError } = useQuery({
    queryKey: ['tribes', tribeId],
    queryFn: () => fetchTribeById(tribeId!),
    enabled: !!tribeId,
  })

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['tribes', tribeId, 'members'],
    queryFn: () => fetchTribeMembers(tribeId!),
    enabled: !!tribeId,
  })

  const isMember = members.some((m) => m.user_id === user?.id)

  if (tribeLoading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <div className="glass-card h-48 rounded-xl animate-pulse" />
          <div className="glass-card h-64 rounded-xl animate-pulse opacity-60" />
        </div>
      </PageWrapper>
    )
  }

  if (tribeError || !tribe) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-white/20">error</span>
          <p className="font-lexend font-bold uppercase text-white/40">Tribe not found</p>
          <NeonButton size="sm" onClick={() => navigate('/fan-zone/tribes')}>
            Back to Tribes
          </NeonButton>
        </div>
      </PageWrapper>
    )
  }

  // Top 3 members by XP
  const topMembers = [...members]
    .filter((m) => m.user)
    .sort((a, b) => (b.user?.xp ?? 0) - (a.user?.xp ?? 0))
    .slice(0, 3)

  return (
    <PageWrapper>
      {/* ── Back button ── */}
      <button
        onClick={() => navigate('/fan-zone/tribes')}
        className="flex items-center gap-2 text-white/40 hover:text-white/80 font-lexend text-xs uppercase font-semibold mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        All Tribes
      </button>

      {/* ── Tribe hero ── */}
      <GlassCard
        className={cn(
          'p-8 mb-8 relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10',
          'from-primary-container/20 to-transparent'
        )}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {/* Badge */}
          <div className="w-24 h-24 rounded-2xl bg-primary-container/20 border-2 border-primary-container/40 flex items-center justify-center shrink-0">
            {tribe.badge_url ? (
              <img
                src={tribe.badge_url}
                alt={tribe.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="material-symbols-outlined text-5xl text-primary-container">shield</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-lexend font-black text-4xl md:text-5xl uppercase text-white mb-2">
              {tribe.name}
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="px-5 py-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="font-lexend font-black text-2xl text-primary-container">
                  {tribe.total_points.toLocaleString()}
                </p>
                <p className="text-[10px] text-white/40 uppercase font-lexend font-semibold mt-0.5">
                  Total Points
                </p>
              </div>
              <div className="px-5 py-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="font-lexend font-black text-2xl">
                  {tribe.member_count.toLocaleString()}
                </p>
                <p className="text-[10px] text-white/40 uppercase font-lexend font-semibold mt-0.5">
                  Members
                </p>
              </div>
              <div className="px-5 py-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="font-lexend font-black text-2xl text-primary-container">
                  {members.length > 0
                    ? Math.round(tribe.total_points / members.length).toLocaleString()
                    : '—'}
                </p>
                <p className="text-[10px] text-white/40 uppercase font-lexend font-semibold mt-0.5">
                  Avg XP / Member
                </p>
              </div>
            </div>

            {/* Action */}
            {user && !isMember && (
              <div className="mt-5 flex justify-center md:justify-start">
                <NeonButton
                  size="sm"
                  disabled={isJoining(tribe.id)}
                  onClick={() => joinMutation.mutate(tribe.id)}
                >
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  {isJoining(tribe.id) ? 'Joining…' : 'Join Tribe'}
                </NeonButton>
              </div>
            )}
            {isMember && (
              <div className="mt-5 flex justify-center md:justify-start">
                <button
                  disabled={isLeaving(tribe.id)}
                  onClick={() => leaveMutation.mutate(tribe.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-white/40 text-base">logout</span>
                  <span className="font-lexend font-bold uppercase text-white/40 text-xs">
                    {isLeaving(tribe.id) ? 'Leaving…' : 'Leave Tribe'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Members ── */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6">
            <h2 className="font-lexend font-black uppercase text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">groups</span>
              Members
              <span className="ml-auto text-xs text-white/30 font-normal font-lexend">
                {members.length}
              </span>
            </h2>

            {membersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-white/30 font-lexend text-sm text-center py-8">
                No members yet
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member, idx) => {
                  if (!member.user) return null
                  const rank = topMembers.findIndex((m) => m.user_id === member.user_id) + 1

                  return (
                    <div
                      key={member.user_id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                        rank === 1
                          ? 'bg-primary-container/8 border-primary-container/25'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                      )}
                      onClick={() => navigate(`/profile/${member.user_id}`)}
                    >
                      {/* Rank badge */}
                      <span
                        className={cn(
                          'font-lexend font-black text-base w-6 text-center shrink-0',
                          rank === 1
                            ? 'text-primary-container'
                            : rank === 2
                            ? 'text-blue-300'
                            : rank === 3
                            ? 'text-amber-300'
                            : 'text-white/20'
                        )}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${idx + 1}`}
                      </span>

                      <Avatar
                        src={member.user.avatar_url}
                        username={member.user.username}
                        size="md"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-lexend font-bold uppercase text-sm truncate">
                          {member.user.username}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] font-lexend uppercase font-semibold',
                            member.user.tier === 'mvp'
                              ? 'text-primary-container'
                              : member.user.tier === 'pro'
                              ? 'text-purple-400'
                              : member.user.tier === 'elite'
                              ? 'text-blue-400'
                              : 'text-white/30'
                          )}
                        >
                          {member.user.tier}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-lexend font-black text-primary-container text-sm">
                          {member.user.xp.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-white/30 font-lexend uppercase">XP</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── Sidebar: top performers ── */}
        <aside className="lg:col-span-5 space-y-5">
          {/* Top 3 leaderboard */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary-container">emoji_events</span>
              <h3 className="font-lexend font-black uppercase text-lg">Top Performers</h3>
            </div>

            {topMembers.length === 0 ? (
              <p className="text-white/30 font-lexend text-xs text-center py-4">
                No members yet
              </p>
            ) : (
              <div className="space-y-2 mb-5">
                {topMembers.map((member, idx) => {
                  if (!member.user) return null
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <div
                      key={member.user_id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                        idx === 0
                          ? 'bg-primary-container/10 border-primary-container/30'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      )}
                      onClick={() => navigate(`/profile/${member.user_id}`)}
                    >
                      <span
                        className={cn(
                          'font-lexend font-black text-xl w-6 text-center',
                          idx === 0 ? 'text-primary-container' : 'text-white/30'
                        )}
                      >
                        {medals[idx]}
                      </span>
                      <Avatar
                        src={member.user.avatar_url}
                        username={member.user.username}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-lexend font-bold uppercase text-xs truncate">
                          {member.user.username}
                        </p>
                        <p className="text-[10px] text-white/30 font-lexend uppercase">
                          {member.user.global_rank ? `#${member.user.global_rank} Global` : '—'}
                        </p>
                      </div>
                      <span className="font-lexend font-black text-base text-primary-container">
                        {(member.user?.xp ?? 0).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <NeonButton
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => navigate(`/profile/${user?.id}/friends`)}
            >
              <span className="material-symbols-outlined text-base">emoji_events</span>
              Challenger League
            </NeonButton>
          </GlassCard>

          {/* Info card */}
          <GlassCard className="p-5">
            <h3 className="font-lexend font-bold uppercase text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">info</span>
              About this Tribe
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 font-lexend text-xs uppercase">Name</span>
                <span className="font-lexend font-bold text-sm">{tribe.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 font-lexend text-xs uppercase">Members</span>
                <span className="font-lexend font-bold text-sm">{tribe.member_count}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 font-lexend text-xs uppercase">Total Points</span>
                <span className="font-lexend font-bold text-sm text-primary-container">
                  {tribe.total_points.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/40 font-lexend text-xs uppercase">Avg XP</span>
                <span className="font-lexend font-bold text-sm">
                  {members.length > 0
                    ? Math.round(tribe.total_points / members.length).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </PageWrapper>
  )
}