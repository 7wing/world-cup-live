import { PageWrapper } from '@/components/layout/PageWrapper'
import { BadgeGrid } from '@/components/passport/BadgeGrid'
import { XPBar } from '@/components/passport/XPBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { usePassport, usePredictionHistory } from '@/hooks/usePassport'
import { cn } from '@/utils/cn'

export function PassportPage() {
  const { user } = useAuthStore()
  const { data: badges, isLoading: badgesLoading } = usePassport(user?.id ?? '')
  const { data: predictions } = usePredictionHistory(user?.id ?? '')

  if (!user) return null

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8 glass-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-container active-glow">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="font-lexend font-black text-4xl text-primary-container">{user.username.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary font-lexend font-semibold px-3 py-1 rounded-sm text-xs tracking-tighter uppercase">
              {user.tier}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-lexend font-black text-4xl uppercase text-white mb-2">{user.username.toUpperCase()}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                <span className="block text-xs font-lexend font-semibold text-white/40 uppercase">Global Rank</span>
                <span className="font-lexend font-black text-3xl text-primary-container">#{user.global_rank ?? '—'}</span>
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                <span className="block text-xs font-lexend font-semibold text-white/40 uppercase">Total XP</span>
                <span className="font-lexend font-black text-3xl">{user.xp.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-4">
          <XPBar user={user} />
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h2 className="font-lexend font-black text-3xl uppercase italic">Digital Passport</h2>
          <button className="text-primary-container font-lexend font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
            View Full Book <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {badgesLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="glass-card aspect-[3/4] rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <BadgeGrid badges={badges ?? []} />
        )}
      </section>

      {predictions && predictions.length > 0 && (
        <section>
          <h2 className="font-lexend font-bold uppercase text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">analytics</span>
            Recent Predictions
            <span className="ml-auto text-[10px] bg-primary-container/20 text-primary-container px-3 py-1 rounded-full border border-primary-container/30">
              {Math.round((predictions.filter((p) => p.is_correct).length / predictions.length) * 100)}% Accuracy
            </span>
          </h2>
          <GlassCard className="overflow-hidden">
            {predictions.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded flex items-center justify-center', p.is_correct ? 'bg-primary-container/20 border border-primary-container/40' : 'bg-error/20 border border-error/40')}>
                    <span className={cn('material-symbols-outlined', p.is_correct ? 'text-primary-container' : 'text-error')} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {p.is_correct ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <p className="font-lexend font-semibold uppercase text-sm">Predicted: {p.predicted_home} - {p.predicted_away}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('font-lexend font-black text-xl', p.points_earned > 0 ? 'text-primary-container' : 'text-white/40')}>
                    {p.points_earned > 0 ? `+${p.points_earned}` : p.points_earned}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase">Points</p>
                </div>
              </div>
            ))}
          </GlassCard>
        </section>
      )}
    </PageWrapper>
  )
}