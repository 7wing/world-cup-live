import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VenueHero } from '@/components/stadiums/VenueHero'
import { ReviewForm } from '@/components/stadiums/ReviewForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatBadge } from '@/components/ui/StatBadge'
import { Avatar } from '@/components/ui/Avatar'
import { useStadium, useStadiumReviews, useStadiumPhotos } from '@/hooks/useStadium'
import { formatRelative } from '@/utils/formatDate'

export function StadiumDetailPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>()
  const { data: stadium, isLoading } = useStadium(stadiumId!)
  const { data: reviews } = useStadiumReviews(stadiumId!)
  const { data: photos } = useStadiumPhotos(stadiumId!)
  const [showReviewForm, setShowReviewForm] = useState(false)

  if (isLoading) return <PageWrapper><div className="h-96 glass-card rounded-xl animate-pulse" /></PageWrapper>
  if (!stadium) return <PageWrapper><p className="text-white/40">Stadium not found.</p></PageWrapper>

  return (
    <PageWrapper>
      <VenueHero stadium={stadium} onReview={() => setShowReviewForm(true)} />

      {showReviewForm && (
        <div className="my-6">
          <ReviewForm stadiumId={stadium.id} onClose={() => setShowReviewForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <StatBadge value={stadium.total_reviews > 999 ? `${Math.round(stadium.total_reviews/1000)}K` : stadium.total_reviews} label="Total Reviews" />
        <StatBadge value={stadium.security_score.toFixed(1)} label="Security Score" highlighted />
        <StatBadge value={stadium.transport_status} label="Transport" />
        <StatBadge value={`${stadium.avg_rating.toFixed(1)}/5`} label="Avg Rating" highlighted />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase mb-6">Fan Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[
                  { label: 'Atmosphere', value: stadium.avg_atmosphere * 20 },
                  { label: 'Food & Bev', value: stadium.avg_food * 20 },
                  { label: 'Hotels', value: stadium.avg_hotel * 20 },
                  { label: 'Safety', value: stadium.avg_safety * 20 },
                ].map(({ label, value }) => (
                  <ProgressBar key={label} value={value} label={label} showLabel />
                ))}
              </div>
              <div className="flex flex-col items-center justify-center bg-primary-container/5 border border-primary-container/20 rounded-xl p-6 text-center">
                <span className="font-lexend text-6xl font-black text-primary-container mb-2">A+</span>
                <p className="font-lexend font-semibold uppercase text-white">Elite Venue Rating</p>
                <p className="text-sm text-white/40 mt-3 italic">"The thunderous roar at this stadium is unlike anything in world sports."</p>
              </div>
            </div>

            {reviews && reviews.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-lexend text-xs uppercase text-white/40 font-semibold tracking-widest">Recent Reviews</h3>
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={r.user?.avatar_url} username={r.user?.username} size="sm" />
                        <span className="font-lexend font-semibold text-sm text-white">{r.user?.username}</span>
                      </div>
                      <span className="text-[10px] text-white/40 uppercase">{formatRelative(r.created_at)}</span>
                    </div>
                    {r.body && <p className="text-sm text-white/70">{r.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {photos && photos.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="font-lexend font-bold uppercase mb-4">Fan Photos</h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.slice(0, 9).map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={photo.image_url} alt={photo.caption ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">directions_bus</span>
              Transport & Arrival
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border-l-4 border-primary-container">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-lexend font-semibold text-white uppercase text-xs">Official Shuttle</span>
                  <span className="bg-primary-container/20 text-primary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">Active</span>
                </div>
                <p className="text-sm text-white/70">Frequency: Every 8 mins</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">gpp_maybe</span>
              Safety & Protocols
            </h2>
            <div className="p-4 bg-white/5 rounded-lg flex gap-4 items-center">
              <span className="material-symbols-outlined text-4xl text-primary-container">inventory_2</span>
              <div>
                <p className="text-sm font-bold text-white">CLEAR BAG ONLY</p>
                <p className="text-xs text-white/50">Max size: 12" x 6" x 12"</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-center">
                <p className="text-[10px] text-white/60 uppercase">Medical</p>
                <p className="font-bold text-error text-lg">911</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded text-center">
                <p className="text-[10px] text-white/60 uppercase">Venue SOS</p>
                <p className="font-bold text-white text-lg">#555</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  )
}