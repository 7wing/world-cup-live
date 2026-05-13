import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScoreCard } from '@/components/matches/ScoreCard'
import { VibeMeter } from '@/components/matches/VibeMeter'
import { LiveChatPanel } from '@/components/fanzone/LiveChatPanel'
import { OraclePrediction } from '@/components/games/OraclePrediction'
import { GlassCard } from '@/components/ui/GlassCard'
import { useMatch } from '@/hooks/useMatches'

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data: match, isLoading } = useMatch(matchId!)

  if (isLoading) return <PageWrapper><div className="glass-card h-64 rounded-xl animate-pulse" /></PageWrapper>
  if (!match) return <PageWrapper><p className="text-white/40">Match not found.</p></PageWrapper>

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ScoreCard match={match} />
          <VibeMeter value={98} />
          <OraclePrediction match={match} />
        </div>
        <div className="lg:col-span-4">
          <GlassCard className="h-[600px] flex flex-col overflow-hidden">
            <LiveChatPanel matchId={match.id} />
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  )
}