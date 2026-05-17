import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTribes, joinTribe } from '@/api/fanzone'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

export function TribesPage() {
  const { data: tribes, isLoading } = useQuery({ queryKey: ['tribes'], queryFn: fetchTribes })
  const { user } = useAuthStore()
  const { push } = useNotificationStore()
  const qc = useQueryClient()

  const { mutate: join, isPending } = useMutation({
    mutationFn: (tribeId: string) => {
      if (!user) throw new Error('Not logged in')
      return joinTribe(user.id, tribeId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tribes'] })
      push('Joined tribe!', 'success')
    },
    onError: () => push('Could not join tribe', 'error'),
  })

  return (
    <PageWrapper>
      <h1 className="font-lexend font-black text-5xl uppercase italic mb-8">Tribes</h1>
      {isLoading && <div className="glass-card h-48 rounded-xl animate-pulse" />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tribes?.map((tribe) => (
          <GlassCard key={tribe.id} className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container">shield</span>
              </div>
              <div>
                <h3 className="font-lexend font-bold uppercase">{tribe.name}</h3>
                <p className="text-[11px] text-white/40 uppercase">{tribe.member_count.toLocaleString()} members</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-lexend font-black text-2xl text-primary-container">{tribe.total_points.toLocaleString()}</span>
              <span className="text-xs text-white/40 uppercase font-semibold">total points</span>
            </div>
            <NeonButton
              variant="outline"
              size="sm"
              className="w-full justify-center"
              disabled={isPending || !user}
              onClick={() => join(tribe.id)}
            >
              Join Tribe
            </NeonButton>
          </GlassCard>
        ))}
      </div>
    </PageWrapper>
  )
}