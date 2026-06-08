// src/components/stadiums/VenueHero.tsx

import { useState } from 'react'
import { NeonButton } from '@/components/ui/NeonButton'
import type { Stadium } from '@/types'

interface VenueHeroProps {
  stadium: Stadium
  onReview: () => void
}

/**
 * Full-bleed hero for the stadium detail page.
 *
 * `stadium.hero_image_url` is already the locally-bundled asset URL
 * (injected by `useStadium` → `withLocalHero`) so we use it directly
 * without any Supabase optimisation transforms.
 */
export function VenueHero({ stadium, onReview }: VenueHeroProps) {
  const [imgError,  setImgError]  = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const heroSrc = stadium.hero_image_url ?? null

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden glass-surface border-2 border-yellow-500/30">
      {/* Base gradient — always visible as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 via-surface-container to-black" />

      {/* Loading shimmer — shown while image is in-flight */}
      {!imgLoaded && !imgError && heroSrc && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse" />
      )}

      {/* Hero image */}
      {heroSrc && !imgError && (
        <img
          src={heroSrc}
          alt={stadium.name}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imgLoaded ? 'opacity-60' : 'opacity-0'
          }`}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-primary-container text-on-primary font-lexend text-[10px] px-3 py-1 rounded-sm uppercase font-semibold">
              Category 1 Venue
            </span>
            {stadium.capacity != null && (
              <span className="bg-white/10 text-white font-lexend text-[10px] px-3 py-1 rounded-sm uppercase backdrop-blur-md">
                {stadium.capacity.toLocaleString()} Capacity
              </span>
            )}
            <div className="flex items-center gap-1 text-yellow-400">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-lexend font-bold text-lg">
                {(stadium.avg_rating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>
          <h1 className="font-lexend text-5xl font-black text-white uppercase italic">
            {stadium.name}
          </h1>
          <p className="text-white/70 text-lg mt-2">
            {stadium.city}, {stadium.country}
          </p>
        </div>
        <NeonButton size="lg" onClick={onReview}>Rate This Venue</NeonButton>
      </div>
    </div>
  )
}