import { useState, useEffect, useMemo } from 'react'
import type { Stadium } from '@/types'
import { getOptimizedImageUrl } from '@/hooks/useStadium'

const HERO_SLIDES = 5

interface StadiumHeroProps {
  stadiums: Stadium[]
  isLoading: boolean
}

export function StadiumHero({ stadiums, isLoading }: StadiumHeroProps) {
  const slides = useMemo(
    () =>
      stadiums.slice(0, HERO_SLIDES).map((s) => ({
        ...s,
        hero_image_url: getOptimizedImageUrl(s.hero_image_url, 960, 75),
      })),
    [stadiums],
  )

  const [index, setIndex] = useState(0)
  const current = slides[index]?.hero_image_url ?? null

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [slides.length])

  // Warm hero slide images once (small set, resized server-side)
  useEffect(() => {
    slides.forEach((s) => {
      if (!s.hero_image_url) return
      const img = new Image()
      img.src = s.hero_image_url
    })
  }, [slides])

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 h-64 isolate bg-surface-container-low">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-black" />

      {current && (
        <img
          key={current}
          src={current}
          alt=""
          width={960}
          height={256}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {isLoading && !current && (
        <div className="absolute inset-0 bg-white/5 z-[1]" />
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
            { val: stadiums.length > 0 ? String(stadiums.length) : '16', label: 'Host Venues' },
            { val: '3', label: 'Nations' },
            { val: '1M+', label: 'Total Capacity' },
            { val: '104', label: 'Matches' },
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
                onClick={() => setIndex(i)}
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
