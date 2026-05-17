import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScoreCard } from '@/components/matches/ScoreCard'
import { StandingsTable } from '@/components/matches/StandingsTable'
import { OraclePrediction } from '@/components/games/OraclePrediction'
import { useMatches } from '@/hooks/useMatches'

const MOCK_STANDINGS = [
  { pos: 1, team: 'Brazil', played: 2, gd: 4, points: 6, qualified: true },
  { pos: 2, team: 'Germany', played: 2, gd: 2, points: 3, qualified: true },
  { pos: 3, team: 'Ghana', played: 2, gd: -1, points: 3 },
  { pos: 4, team: 'Korea Rep', played: 2, gd: -5, points: 0 },
]

export function MatchesPage() {
  const navigate = useNavigate()
  const { data: matches, isLoading } = useMatches()

  const live = matches?.filter((m) => m.status === 'live') ?? []
  const upcoming = matches?.filter((m) => m.status === 'upcoming') ?? []
  const finished = matches?.filter((m) => m.status === 'finished') ?? []

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6 min-w-0">
          {live.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary-container" />
                  Live Now
                </h2>
                <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00ff41]" />
                  <span className="font-lexend text-[12px] font-bold text-primary-container">{live.length} LIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {live.map((m) => (
                  <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2 mb-3">
                <span className="w-1 h-6 bg-white/20" /> Next Up
              </h2>
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                ))}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section>
              <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2 mb-3">
                <span className="w-1 h-6 bg-white/20" /> Final Scores
              </h2>
              <div className="space-y-3">
                {finished.map((m) => (
                  <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                ))}
              </div>
            </section>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="glass-card h-24 rounded-xl animate-pulse" />)}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6 min-w-0">
          <StandingsTable standings={MOCK_STANDINGS} />
          {live[0] && <OraclePrediction match={live[0]} />}
        </div>
      </div>
    </PageWrapper>
  )
}