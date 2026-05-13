import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'

export function BracketsPage() {
  return (
    <PageWrapper>
      <h1 className="font-lexend font-black text-4xl uppercase italic mb-8">Tournament Brackets</h1>
      <GlassCard className="p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-primary-container mb-4 block">account_tree</span>
        <p className="text-white/60">Full bracket view — coming as the tournament progresses.</p>
      </GlassCard>
    </PageWrapper>
  )
}