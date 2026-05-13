import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'

const TRIBES_LEADERBOARD = [
  { rank: 1, name: 'Samba Kings', points: 12840, trend: 'up' },
  { rank: 2, name: 'Die Mannschaft', points: 11205, trend: 'neutral' },
  { rank: 3, name: 'The Lions', points: 9800, trend: 'down' },
  { rank: 4, name: 'La Roja', points: 8102, trend: 'neutral' },
]

export function GamesPage() {
  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00FF41]" />
        <span className="text-primary-container font-lexend font-semibold uppercase text-sm">Live Fan Games Hub</span>
      </div>
      <h1 className="font-lexend font-black text-5xl uppercase italic mb-8">Fan Games & AI Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <GlassCard className="md:col-span-8 p-6 min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary-container">psychology</span>
              <h2 className="font-lexend font-bold uppercase italic">AI Smart Trivia</h2>
            </div>
            <p className="text-white/80 mb-6">Prove you're a True Fan. Our AI engine generates real-time questions based on the last 15 minutes of play.</p>
            <div className="glass-card p-4 border-primary-container/30 mb-4">
              <p className="text-xs text-primary-container uppercase font-lexend font-semibold mb-2">Current AI Question</p>
              <p className="text-white">"Which midfielder completed 15 consecutive passes in the final third during the current Brazil vs France match?"</p>
            </div>
            <div className="flex gap-4">
              {['Caseimiro', 'Paquetá'].map((opt) => (
                <button key={opt} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 py-3 font-lexend font-semibold transition-all rounded-sm">{opt}</button>
              ))}
            </div>
          </div>
          <NeonButton className="mt-6">Start Duel</NeonButton>
        </GlassCard>

        <GlassCard className="md:col-span-4 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary-container">groups</span>
            <h2 className="font-lexend font-bold uppercase italic">Tribe Battleground</h2>
          </div>
          <div className="space-y-4 flex-1">
            {TRIBES_LEADERBOARD.map(({ rank, name, points, trend }) => (
              <div key={name} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <span className="font-lexend font-black text-xl text-primary-container italic w-6">{String(rank).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="font-lexend font-semibold uppercase text-sm">{name}</p>
                  <p className="text-[10px] text-white/40 font-semibold uppercase">{points.toLocaleString()} pts</p>
                </div>
                <span className={`material-symbols-outlined text-sm ${trend === 'up' ? 'text-primary-container' : trend === 'down' ? 'text-error' : 'text-white/40'}`}>
                  {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'remove'}
                </span>
              </div>
            ))}
          </div>
          <NeonButton variant="outline" className="w-full justify-center mt-4">Join a Tribe</NeonButton>
        </GlassCard>
      </div>
    </PageWrapper>
  )
}