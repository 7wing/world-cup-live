// src/pages/stadiums/StadiumsPage.tsx

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StadiumHero } from '@/components/stadiums/StadiumHero'
import { StadiumCard } from '@/components/stadiums/StadiumCard'
import { useStadiums } from '@/hooks/useStadium'

type Country = 'all' | 'USA' | 'Canada' | 'Mexico'

const FILTERS: { label: string; value: Country }[] = [
  { label: 'All (16)', value: 'all' },
  { label: '🇺🇸 USA',   value: 'USA' },
  { label: '🇨🇦 Canada', value: 'Canada' },
  { label: '🇲🇽 Mexico', value: 'Mexico' },
]

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/3 border border-white/7">
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isFetching, isError, error, refetch, status } = useStadiums()

  const stadiums = data ?? []

  const isLoading = stadiums.length === 0 && (isFetching || status === 'pending')

  const [search, setSearch]   = useState('')
  const [country, setCountry] = useState<Country>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return stadiums.filter((s) => {
      const matchCountry = country === 'all' || s.country === country
      const matchSearch  =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      return matchCountry && matchSearch
    })
  }, [stadiums, search, country])

  const handleSelect = useCallback(
    (slug: string) => navigate(`/stadiums/${slug}`),
    [navigate],
  )

  return (
    <PageWrapper>
      <StadiumHero stadiums={stadiums} isLoading={isLoading} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-white/10 focus:border-primary-container/50 text-white placeholder:text-white/20 pl-10 pr-4 h-11 rounded-xl outline-none transition-colors duration-200 text-sm font-lexend"
            placeholder="Search stadiums or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCountry(value)}
              className={`
                px-3 sm:px-4 h-11 rounded-xl text-xs font-lexend font-bold uppercase tracking-wide border
                transition-colors duration-200 whitespace-nowrap flex-shrink-0
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

      <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25 mb-4">
        {isLoading
          ? 'Loading venues...'
          : filtered.length === stadiums.length
            ? `Showing all ${stadiums.length} venues`
            : `${filtered.length} venue${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {isError && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center space-y-4">
          <p className="text-red-400 font-lexend text-sm">
            Could not load stadiums
            {(error as Error)?.message ? `: ${(error as Error).message}` : ''}.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-primary-container/15 border border-primary-container/40 text-primary-container font-lexend font-bold text-xs uppercase tracking-wide hover:bg-primary-container/25 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isError && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isError && !isLoading && filtered.length === 0 && (
        <p className="text-white/30 text-sm text-center py-20">
          No stadiums match your search.
        </p>
      )}

      {!isError && !isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((stadium) => (
            <StadiumCard
              key={stadium.id}
              stadium={stadium}
              onSelect={handleSelect}

            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}