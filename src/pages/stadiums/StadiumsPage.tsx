import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useStadiums } from '@/hooks/useStadium'

type Country = 'all' | 'USA' | 'Canada' | 'Mexico'

const FILTERS: { label: string; value: Country }[] = [
  { label: 'All (16)', value: 'all'    },
  { label: '🇺🇸 USA',   value: 'USA'    },
  { label: '🇨🇦 Canada', value: 'Canada' },
  { label: '🇲🇽 Mexico', value: 'Mexico' },
]

// Skeleton card shown while loading
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/3 border border-white/7 animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-2 bg-white/5 rounded w-3/4" />
        <div className="h-2 bg-white/5 rounded w-1/2" />
        <div className="h-2 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  )
}

export function StadiumsPage() {
  const navigate = useNavigate()
  const { data: stadiums = [], isLoading } = useStadiums()

  const [search, setSearch]   = useState('')
  const [country, setCountry] = useState<Country>('all')
  const [heroBg, setHeroBg]   = useState(0)

  // Rotate hero background through loaded stadiums
  useEffect(() => {
    if (stadiums.length === 0) return
    const interval = setInterval(() => {
      setHeroBg((prev) => (prev + 1) % stadiums.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [stadiums.length])

  const filtered = stadiums.filter((s) => {
    const matchCountry = country === 'all' || s.country === country
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    return matchCountry && matchSearch
  })

  const heroStadium = stadiums[heroBg]

  return (
    <PageWrapper>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl mb-8 h-64">

        {/* Background images — only mount adjacent ones */}
        {stadiums.map((s, i) => {
          const isVisible  = heroBg === i
          const isAdjacent =
            Math.abs(heroBg - i) <= 1 ||
            (heroBg === 0 && i === stadiums.length - 1) ||
            (heroBg === stadiums.length - 1 && i === 0)

          if (!isVisible && !isAdjacent) return null

          return s.hero_image_url ? (
            <img
              key={s.id}
              src={s.hero_image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: isVisible ? 1 : 0, zIndex: isVisible ? 1 : 0 }}
            />
          ) : (
            // Fallback gradient when no hero image in DB yet
            <div
              key={s.id}
              className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-black"
              style={{ opacity: isVisible ? 1 : 0, zIndex: isVisible ? 1 : 0 }}
            />
          )
        })}

        {/* Loading shimmer before data arrives */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/3 animate-pulse" style={{ zIndex: 1 }} />
        )}

        {/* Gradient + grid overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" style={{ zIndex: 2 }} />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            zIndex: 2,
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.5) 39px,rgba(255,255,255,0.5) 40px),' +
              'repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.5) 39px,rgba(255,255,255,0.5) 40px)',
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8" style={{ zIndex: 3 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/80">
              Live Season 2026
            </span>
          </div>

          <h1 className="font-lexend font-black text-4xl sm:text-5xl uppercase italic leading-none tracking-tight">
            Stadium <span className="text-primary-container">Explorer</span>
          </h1>
          <p className="text-white/70 text-xs sm:text-sm mt-2">
            Navigate the legendary battlegrounds of the 2026 FIFA World Cup
          </p>

          <div className="flex gap-4 sm:gap-6 mt-4">
            {[
              { val: '16',  label: 'Host Venues'    },
              { val: '3',   label: 'Nations'        },
              { val: '1M+', label: 'Total Capacity' },
              { val: '104', label: 'Matches'        },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="font-lexend font-black text-lg sm:text-xl text-primary-container leading-none">{val}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60 font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {stadiums.length > 0 && (
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {stadiums.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroBg(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    heroBg === i
                      ? 'w-4 bg-primary-container'
                      : 'w-1 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-white/10 focus:border-primary-container/50 text-white placeholder:text-white/20 pl-10 pr-4 h-11 rounded-xl outline-none transition-all text-sm font-lexend"
            placeholder="Search stadiums or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setCountry(value)}
              className={`
                px-3 sm:px-4 h-11 rounded-xl text-xs font-lexend font-bold uppercase tracking-wide border transition-all whitespace-nowrap flex-shrink-0
                ${country === value
                  ? 'bg-primary-container/15 border-primary-container/50 text-primary-container'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result count ── */}
      <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25 mb-4">
        {isLoading
          ? 'Loading venues...'
          : filtered.length === stadiums.length
            ? `Showing all ${stadiums.length} venues`
            : `${filtered.length} venue${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-20">
          No stadiums match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((stadium) => (
            <GlassCard
              key={stadium.id}
              className="overflow-hidden cursor-pointer hover:border-primary-container/30 transition-all group"
              onClick={() => navigate(`/stadiums/${stadium.slug}`)}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {stadium.hero_image_url ? (
                  <img
                    src={stadium.hero_image_url}
                    alt={stadium.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-container/15 to-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-white/10">stadium</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-lexend font-bold text-white/70">
                  {stadium.flag} {stadium.country}
                </div>

                <div className="absolute top-3 right-3 bg-black/60 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] font-lexend font-bold text-white/40 uppercase tracking-wide">
                  {(stadium.capacity / 1000).toFixed(0)}K seats
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-lexend font-black uppercase text-base leading-tight">{stadium.name}</h3>
                  <p className="text-[11px] text-white/50 mt-0.5">{stadium.city}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="space-y-2.5">
                  <ProgressBar value={stadium.avg_atmosphere * 20} label="Atmosphere" showLabel />
                  <ProgressBar value={stadium.avg_food       * 20} label="Food & Bev" showLabel />
                  <ProgressBar value={stadium.avg_safety     * 20} label="Safety"     showLabel />
                </div>

                <div className="flex justify-between items-end pt-1 border-t border-white/5">
                  <div>
                    <span className="font-lexend font-black text-2xl text-primary-container">
                      {stadium.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/25 font-lexend font-bold uppercase tracking-wide ml-1">
                      / 5
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-lexend font-semibold text-white/40">
                      {stadium.total_reviews.toLocaleString()} reviews
                    </p>
                    {stadium.note && (
                      <p className="text-[10px] text-white/25 mt-0.5 italic">{stadium.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

    </PageWrapper>
  )
}