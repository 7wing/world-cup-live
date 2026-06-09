// src/components/stadiums/StadiumHero.tsx

import { useState, useEffect, useMemo } from 'react'
import type { Stadium } from '@/types'

interface StadiumHeroProps {
  stadiums: Stadium[]
  isLoading: boolean
}

function formatCapacity(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M+`
  if (total >= 1_000)     return `${Math.round(total / 1_000)}K+`
  return String(total)
}

export function StadiumHero({ stadiums, isLoading }: StadiumHeroProps) {
  const slides = useMemo(() => stadiums, [stadiums])

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Derived stats from live data
  const nationsCount = useMemo(
    () => new Set(stadiums.map((s) => s.country)).size,
    [stadiums]
  )
  const totalCapacity = useMemo(
    () => stadiums.reduce((sum, s) => sum + (s.capacity ?? 0), 0),
    [stadiums]
  )

  // Auto-advance with a brief fade-out/in between slides
  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length)
        setVisible(true)
      }, 300)
    }, 6000)
    return () => clearInterval(id)
  }, [slides.length])

  function goTo(i: number) {
    if (i === index) return
    setVisible(false)
    setTimeout(() => {
      setIndex(i)
      setVisible(true)
    }, 300)
  }

  const current = slides[index]?.hero_image_url ?? null

  // Warm all slide images into browser cache so carousel switching is instant
  useEffect(() => {
    slides.forEach((s) => {
      if (!s.hero_image_url) return
      const img = new Image()
      img.decoding = 'async'
      img.src = s.hero_image_url
    })
  }, [slides])

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 h-64 isolate bg-surface-container-low">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-black" />

      {current && (
        <img
          src={current}
          alt={slides[index]?.name ?? ''}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {isLoading && !current && (
        <div className="absolute inset-0 bg-white/5 animate-pulse z-[1]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-[2] pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 z-[3]">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400" />
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
            {
              val: stadiums.length > 0 ? String(stadiums.length) : '—',
              label: 'Host Venues',
            },
            {
              val: nationsCount > 0 ? String(nationsCount) : '—',
              label: 'Nations',
            },
            {
              val: totalCapacity > 0 ? formatCapacity(totalCapacity) : '—',
              label: 'Total Capacity',
            },
            {
              // 104 is the confirmed total match count for FIFA World Cup 2026
              val: '104',
              label: 'Matches',
            },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="font-lexend font-black text-lg sm:text-xl text-primary-container leading-none">{val}</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60 font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show stadium ${i + 1}`}
                className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                  index === i ? 'w-4 bg-primary-container' : 'w-1 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}