import { useState, useEffect } from 'react'
import type { Stadium } from '@/types'

interface StadiumHeroProps {
  stadiums: Stadium[]
  isLoading: boolean
}

export function StadiumHero({ stadiums, isLoading }: StadiumHeroProps) {
  const [heroBg, setHeroBg] = useState(0)

  useEffect(() => {
    if (stadiums.length === 0) return
    const interval = setInterval(() => {
      setHeroBg((prev) => (prev + 1) % stadiums.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [stadiums.length])

  const current = stadiums[heroBg]

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 h-64 isolate bg-surface-container-low">
      {/* Base layer so rotation never flashes pure black */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-black" />

      {current?.hero_image_url && (
        <img
          src={current.hero_image_url}
          alt=""
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {isLoading && stadiums.length === 0 && (
        <div className="absolute inset-0 bg-white/5 animate-pulse z-[1]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-[2] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 z-[2] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.5) 39px,rgba(255,255,255,0.5) 40px),' +
            'repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.5) 39px,rgba(255,255,255,0.5) 40px)',
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 z-[3]">
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

        {stadiums.length > 0 && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {stadiums.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroBg(i)}
                aria-label={`Show stadium ${i + 1}`}
                className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                  heroBg === i ? 'w-4 bg-primary-container' : 'w-1 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
