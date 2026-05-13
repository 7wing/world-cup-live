import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useStadiums } from '@/hooks/useStadium'

export function StadiumsPage() {
  const navigate = useNavigate()
  const { data: stadiums, isLoading } = useStadiums()
  const [search, setSearch] = useState('')

  const filtered = stadiums?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-lexend font-black text-5xl uppercase italic">Stadium Explorer</h1>
          <p className="text-on-surface-variant mt-2">Navigate the legendary battlegrounds of the 2026 World Cup.</p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">search</span>
          <input
            className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary-container text-white placeholder:text-white/20 pl-12 h-12 rounded-t-lg outline-none transition-all"
            placeholder="Search stadiums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map((i) => <div key={i} className="glass-card h-64 rounded-xl animate-pulse" />)}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stadium) => (
          <GlassCard
            key={stadium.id}
            className="p-6 cursor-pointer hover:border-white/20 transition-all space-y-4"
            onClick={() => navigate(`/stadiums/${stadium.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-lexend font-bold uppercase">{stadium.name}</h3>
                <p className="text-xs text-white/40">{stadium.city}, {stadium.country}</p>
              </div>
              <span className="font-lexend font-black text-2xl text-primary-container">{stadium.avg_rating.toFixed(1)}</span>
            </div>
            <div className="space-y-3">
              <ProgressBar value={stadium.avg_atmosphere * 20} label="Atmosphere" showLabel />
              <ProgressBar value={stadium.avg_food * 20} label="Food & Bev" showLabel />
            </div>
            <div className="flex justify-between text-xs font-lexend font-semibold uppercase text-white/40">
              <span>{stadium.capacity.toLocaleString()} capacity</span>
              <span className="text-primary-container">{stadium.total_reviews} reviews</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageWrapper>
  )
}