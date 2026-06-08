// src/components/games/MiniLeagueTab.tsx
import { useQuery } from '@tanstack/react-query'
import { NeonButton } from '@/components/ui/NeonButton'
import { fetchMiniLeague } from '@/api/miniLeague'
import { useAuthStore } from '@/store/authStore'

const MEDALS = ['🥇', '🥈', '🥉']

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'same' }) {
  if (trend === 'up')   return <span className="text-sm font-black text-primary-container">↑</span>
  if (trend === 'down') return <span className="text-sm font-black text-red-400">↓</span>
  return <span className="text-sm font-black text-white/30">–</span>
}

export function MiniLeagueTab() {
  const { user } = useAuthStore()

  const { data: league = [], isLoading } = useQuery({
    queryKey: ['mini_league', user?.id],
    queryFn:  () => fetchMiniLeague(user?.id),
    staleTime: 60_000,
  })

  const me  = league.find((p) => p.you)
  const max = league[0]?.pts ?? 1

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 glass-card rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (league.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-sm font-lexend text-white/30">
          No predictions made yet — be the first to lock in a score!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-[36px_1fr_60px_70px_20px] gap-2 px-4 py-2.5 border-b border-white/5">
          {['#', 'Player', 'Correct', 'Pts', ''].map((h) => (
            <span key={h} className="text-[8px] font-lexend font-black uppercase tracking-widest text-white/30">
              {h}
            </span>
          ))}
        </div>

        {league.map((p) => (
          <div
            key={p.userId}
            className={`grid grid-cols-[36px_1fr_60px_70px_20px] gap-2 items-center px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${
              p.you ? 'bg-primary-container/5 border-l-2 border-l-primary-container' : ''
            }`}
          >
            <span className={`font-lexend font-black italic ${p.rank <= 3 ? 'text-base text-primary-container' : 'text-sm text-white/30'}`}>
              {p.rank <= 3 ? MEDALS[p.rank - 1] : p.rank}
            </span>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-xs shrink-0 font-bold text-primary-container">
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <span className={`text-xs font-lexend font-bold ${p.you ? 'text-primary-container' : 'text-white/80'}`}>
                  {p.name}
                </span>
                {p.you && (
                  <span className="text-[7px] font-lexend font-black uppercase tracking-widest text-primary-container bg-primary-container/10 border border-primary-container/30 px-1.5 py-px rounded">
                    You
                  </span>
                )}
              </div>
              <div className="h-px bg-white/5 rounded-full ml-8">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${p.you ? 'bg-primary-container' : 'bg-white/15'}`}
                  style={{ width: `${(p.pts / max) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] font-lexend font-bold text-white/40 text-center">
              {p.correct} ✓
            </span>
            <span className={`text-sm font-lexend font-black ${p.you ? 'text-primary-container' : 'text-white/80'}`}>
              {p.pts.toLocaleString()}
            </span>
            <TrendBadge trend={p.trend} />
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-3">
        {me && (
          <div className="glass-card rounded-xl p-5">
            <p className="text-[9px] font-lexend font-black uppercase tracking-widest text-white/30 mb-4">
              Your Stats
            </p>
            {[
              { l: 'Ranking',   v: `#${me.rank}`,              highlight: true  },
              { l: 'Total Pts', v: me.pts.toLocaleString(),    highlight: false },
              { l: 'Correct',   v: String(me.correct),         highlight: false },
            ].map((s) => (
              <div key={s.l} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/40 font-lexend">{s.l}</span>
                <span className={`text-sm font-lexend font-black ${s.highlight ? 'text-primary-container' : 'text-white/80'}`}>
                  {s.v}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card rounded-xl p-4 border border-primary-container/20 bg-primary-container/5">
          <p className="text-sm font-lexend font-bold mb-1.5">Invite Friends</p>
          <p className="text-[11px] text-white/40 font-lexend leading-relaxed mb-3">
            Challenge friends and compete for the top spot.
          </p>
          <NeonButton variant="outline" className="w-full justify-center">
            Share League Link →
          </NeonButton>
        </div>
      </div>
    </div>
  )
}