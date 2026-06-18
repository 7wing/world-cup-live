// src/components/stadiums/StadiumCard.tsx

import { memo, useState } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getOptimizedImageUrl } from '@/hooks/useStadium'
import type { Stadium } from '@/types'

interface StadiumCardProps {
  stadium: Stadium
  onSelect: (slug: string) => void
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-container/15 to-[#1a1c1c] flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-white/10">stadium</span>
    </div>
  )
}

export const StadiumCard = memo(function StadiumCard({
  stadium,
  onSelect,
}: StadiumCardProps) {
  // `stadium.hero_image_url` is the locally-bundled asset (already optimised by Vite).
  // We keep a fallback attempt via getOptimizedImageUrl in case the local import
  // somehow fails — for Supabase URLs it appends resize params; for local/other
  // URLs it passes through unchanged.
  const primarySrc  = stadium.hero_image_url ?? null
  const fallbackSrc = getOptimizedImageUrl(stadium.hero_image_url, 512, 60)

  const [imgSrc, setImgSrc]   = useState<string | null>(primarySrc)
  const [attempt, setAttempt] = useState(0)

  function handleError() {
    if (attempt < 1) {
      // First failure: retry once with the fallback. For local images the
      // fallback is the same URL, but we still bump the attempt counter so
      // the <img> key changes and the browser makes a fresh fetch attempt.
      setAttempt((a) => a + 1)
      setImgSrc(fallbackSrc ?? primarySrc)
    } else {
      // Second failure: give up and show the placeholder.
      setImgSrc(null)
    }
  }

  return (
    <article
      className="card-solid overflow-hidden cursor-pointer hover:border-primary-container/30 transition-[border-color] duration-200"
      onClick={() => onSelect(stadium.slug)}
    >
      <div className="relative h-44 overflow-hidden bg-[#1a1c1c]">
        {imgSrc ? (
          <img
            key={`${stadium.id}-${attempt}`}
            src={imgSrc}
            alt={stadium.name}
            width={512}
            height={176}
            loading="eager"
            decoding="async"
            onError={handleError}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-lexend font-bold text-white/70">
          {stadium.flag ?? ''} {stadium.country}
        </div>

        {stadium.capacity != null && (
          <div className="absolute top-3 right-3 bg-black/60 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] font-lexend font-bold text-white/40 uppercase tracking-wide">
            {(stadium.capacity / 1000).toFixed(0)}K seats
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-lexend font-black uppercase text-base leading-tight text-white">
            {stadium.name}
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">{stadium.city}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2.5">
          <ProgressBar value={(stadium.avg_atmosphere ?? 0) * 20} label="Atmosphere" showLabel />
          <ProgressBar value={(stadium.avg_food ?? 0) * 20} label="Food & Bev" showLabel />
          <ProgressBar value={(stadium.avg_safety ?? 0) * 20} label="Safety" showLabel />
        </div>

        <div className="flex justify-between items-end pt-1 border-t border-white/5">
          <div>
            <span className="font-lexend font-black text-2xl text-primary-container">
              {(stadium.avg_rating ?? 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-white/25 font-lexend font-bold uppercase tracking-wide ml-1">
              / 5
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs font-lexend font-semibold text-white/40">
              {(stadium.total_reviews ?? 0).toLocaleString()} reviews
            </p>
            {stadium.note && (
              <p className="text-[10px] text-white/25 mt-0.5 italic">{stadium.note}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
})