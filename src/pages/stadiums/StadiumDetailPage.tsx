// src/pages/stadiums/StadiumDetailPage.tsx

import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VenueHero } from '@/components/stadiums/VenueHero'
import { ReviewForm } from '@/components/stadiums/ReviewForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatBadge } from '@/components/ui/StatBadge'
import { Avatar } from '@/components/ui/Avatar'
import { useStadium, useStadiumReviews, useStadiumPhotos, useUploadFanPhoto, getOptimizedImageUrl } from '@/hooks/useStadium'
import { useAuthStore } from '@/store/authStore'
import { formatRelative } from '@/utils/formatDate'
import { supabase } from '@/lib/supabase'
import type { Match } from '@/types'

type Tab = 'overview' | 'matches' | 'photos' | 'reviews' | 'info'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview',  icon: 'bar_chart'      },
  { id: 'matches',  label: 'Matches',   icon: 'sports_soccer'  },
  { id: 'photos',   label: 'Photos',    icon: 'photo_library'  },
  { id: 'reviews',  label: 'Reviews',   icon: 'reviews'        },
  { id: 'info',     label: 'Transport', icon: 'directions_bus' },
]

const MATCH_SELECT = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*),
  stadium:stadiums(*)
`

async function fetchMatchesByStadium(stadiumId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('stadium_id', stadiumId)
    .order('kickoff_at', { ascending: true })
  if (error) throw error
  return data as Match[]
}

function useStadiumMatches(stadiumId: string) {
  return useQuery({
    queryKey: ['matches', 'stadium', stadiumId],
    queryFn: () => fetchMatchesByStadium(stadiumId),
    enabled: !!stadiumId,
    staleTime: 60_000,
  })
}

function stageColor(stage: string): string {
  if (stage === 'final')         return 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  if (stage === 'semi_final')    return 'text-rose-400 bg-rose-400/10 border-rose-400/30'
  if (stage === 'quarter_final') return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
  if (stage === 'round_of_16')   return 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  return 'text-white/60 bg-white/5 border-white/10'
}

function stageLabel(stage: string): string {
  if (stage === 'final')         return 'Final'
  if (stage === 'semi_final')    return 'Semifinal'
  if (stage === 'quarter_final') return 'Quarterfinal'
  if (stage === 'round_of_16')   return 'Round of 16'
  if (stage === 'third_place')   return 'Third Place'
  return 'Group Stage'
}

function localTime(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function localDate(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-base ${
            star <= Math.round(value) ? 'text-amber-400' : 'text-white/15'
          }`}
        >
          star
        </span>
      ))}
    </div>
  )
}

function PhotoTile({ src, caption }: { src: string; caption: string | null }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)
  const optimized = getOptimizedImageUrl(src, 400, 70)

  return (
    <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low relative">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
      {!error && optimized && (
        <img
          src={optimized}
          alt={caption ?? ''}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pointer-events-none">
          <p className="text-[10px] text-white/80 font-lexend leading-snug line-clamp-2">{caption}</p>
        </div>
      )}
    </div>
  )
}

// ── Letter grade derived from avg_rating ─────────────────────────────────────
function venueGrade(avgRating: number | null): string {
  if (avgRating == null) return '—'
  if (avgRating >= 4.5)  return 'A+'
  if (avgRating >= 4.0)  return 'A'
  return 'B+'
}

export function StadiumDetailPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // stadiumId param is the slug; useStadium queries by slug
  const { data: stadium, isLoading } = useStadium(stadiumId!)
  const { data: reviews = [] }       = useStadiumReviews(stadium?.id ?? '')
  const { data: photos  = [] }       = useStadiumPhotos(stadium?.id ?? '')
  const { data: matches = [], isLoading: matchesLoading } = useStadiumMatches(stadium?.id ?? '')
  const { mutate: uploadPhoto, isPending: uploading } = useUploadFanPhoto(stadium?.id ?? '')

  const [activeTab, setActiveTab]           = useState<Tab>('overview')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const fileInputRef                        = useRef<HTMLInputElement>(null)

  function handleUploadClick() {
    if (!user) return
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    uploadPhoto({ userId: user.id, file, caption: '' })
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="h-72 glass-card rounded-2xl animate-pulse mb-6" />
        <div className="h-12 glass-card rounded-xl animate-pulse mb-4" />
        <div className="h-64 glass-card rounded-2xl animate-pulse" />
      </PageWrapper>
    )
  }

  if (!stadium) {
    return (
      <PageWrapper>
        <button
          onClick={() => navigate('/stadiums')}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-lexend font-bold uppercase tracking-widest transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          All Venues
        </button>
        <p className="text-white/40 text-sm">Stadium not found.</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/stadiums')}
        className="flex items-center gap-2 text-white/40 hover:text-white/80 text-[11px] font-lexend font-bold uppercase tracking-widest transition-colors mb-5"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        All Venues
      </button>

      <VenueHero
        stadium={stadium}
        onReview={() => { setShowReviewForm(true); setActiveTab('reviews') }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <StatBadge
          value={stadium.total_reviews > 999
            ? `${Math.round(stadium.total_reviews / 1000)}K`
            : String(stadium.total_reviews ?? 0)}
          label="Total Reviews"
        />
        <StatBadge
          value={stadium.security_score != null ? stadium.security_score.toFixed(1) : '—'}
          label="Security Score"
          highlighted
        />
        <StatBadge value={stadium.transport_status ?? '—'} label="Transport" />
        {/* FIX: was stadium.avg_rating.toFixed(1) — crashes when null */}
        <StatBadge value={`${(stadium.avg_rating ?? 0).toFixed(1)}/5`} label="Avg Rating" highlighted />
      </div>

      <div className="flex gap-1 border-b border-white/8 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 pb-3 pt-1 text-[11px] font-lexend font-bold uppercase tracking-widest
              border-b-2 transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-white/30 hover:text-white/60'}
            `}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5">
              Fan Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {/* FIX: all four values now use ?? 0 so nulls produce 0 not NaN */}
                {[
                  { label: 'Atmosphere',    value: (stadium.avg_atmosphere ?? 0) * 20 },
                  { label: 'Food & Bev',    value: (stadium.avg_food       ?? 0) * 20 },
                  { label: 'Hotels Nearby', value: (stadium.avg_hotel      ?? 0) * 20 },
                  { label: 'Safety',        value: (stadium.avg_safety     ?? 0) * 20 },
                ].map(({ label, value }) => (
                  <ProgressBar key={label} value={value} label={label} showLabel />
                ))}
              </div>
              <div className="flex flex-col items-center justify-center bg-primary-container/5 border border-primary-container/20 rounded-xl p-6 text-center gap-2">
                {/* FIX: extracted venueGrade() helper — safely handles null avg_rating */}
                <span className="font-lexend text-6xl font-black text-primary-container leading-none">
                  {venueGrade(stadium.avg_rating)}
                </span>
                <p className="font-lexend font-bold text-xs uppercase tracking-widest text-white/70">Venue Rating</p>
                {stadium.note && (
                  <p className="text-xs text-white/35 italic leading-relaxed mt-1">"{stadium.note}"</p>
                )}
              </div>
            </div>
          </GlassCard>

          {reviews.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40">Recent Reviews</h2>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-[11px] font-lexend font-bold uppercase tracking-widest text-primary-container/70 hover:text-primary-container transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-4 bg-white/4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={r.user?.avatar_url} username={r.user?.username} size="sm" />
                        <span className="font-lexend font-semibold text-sm text-white">{r.user?.username}</span>
                      </div>
                      <span className="text-[10px] font-lexend uppercase tracking-wide text-white/30">
                        {formatRelative(r.created_at)}
                      </span>
                    </div>
                    {r.body && <p className="text-sm text-white/60 leading-relaxed">{r.body}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── MATCHES ────────────────────────────────────────────────────────── */}
      {activeTab === 'matches' && (
        <GlassCard className="p-6">
          <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5">
            Scheduled Matches · FIFA World Cup 2026
          </h2>

          {matchesLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!matchesLoading && matches.length === 0 && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-white/15 block mb-3">sports_soccer</span>
              <p className="text-white/30 text-sm font-lexend">No matches scheduled yet.</p>
            </div>
          )}

          {!matchesLoading && matches.length > 0 && (
            <div className="space-y-2">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => navigate(`/matches/${match.id}`)}
                  className="flex items-center gap-4 px-4 py-3.5 bg-white/3 hover:bg-white/5 rounded-xl border border-white/5 transition-colors group cursor-pointer"
                >
                  <div className="w-14 flex-shrink-0">
                    <p className="text-[11px] font-lexend font-black text-white/80 uppercase">
                      {localDate(match.kickoff_at)}
                    </p>
                    <p className="text-[10px] text-white/30 font-lexend mt-0.5">
                      {localTime(match.kickoff_at)}
                    </p>
                  </div>
                  <div className="w-px self-stretch bg-white/8" />
                  <div className="flex-1 min-w-0">
                    <p className="font-lexend font-bold text-sm text-white group-hover:text-primary-container transition-colors truncate">
                      {match.home_team?.name ?? 'TBD'} vs {match.away_team?.name ?? 'TBD'}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5 font-lexend">
                      {stadium.name} · {stadium.city}
                    </p>
                  </div>
                  {match.status === 'finished' && (
                    <span className="font-lexend font-black text-sm text-white/60 flex-shrink-0">
                      {match.home_score} – {match.away_score}
                    </span>
                  )}
                  <span className={`text-[10px] font-lexend font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border flex-shrink-0 ${stageColor(match.stage)}`}>
                    {stageLabel(match.stage)}
                  </span>
                  <span className="material-symbols-outlined text-sm text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* ── PHOTOS ─────────────────────────────────────────────────────────── */}
      {activeTab === 'photos' && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40">Fan Photos</h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {user ? (
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex items-center gap-1.5 text-[11px] font-lexend font-bold uppercase tracking-widest text-primary-container/70 hover:text-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-base ${uploading ? 'animate-spin' : ''}`}>
                  {uploading ? 'progress_activity' : 'upload'}
                </span>
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-[11px] font-lexend font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
              >
                <span className="material-symbols-outlined text-base">lock</span>
                Sign in to upload
              </button>
            )}
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 9).map((photo) => (
                <PhotoTile key={photo.id} src={photo.image_url} caption={photo.caption} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-white/15 block mb-3">photo_library</span>
              <p className="text-white/30 text-sm font-lexend">No photos yet. Be the first to upload!</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          {showReviewForm ? (
            <ReviewForm
              stadiumId={stadium.id}
              stadiumSlug={stadium.slug}
              onClose={() => setShowReviewForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-container/10 hover:bg-primary-container/15 border border-primary-container/30 rounded-xl text-primary-container font-lexend font-bold text-xs uppercase tracking-widest transition-all"
            >
              <span className="material-symbols-outlined text-base">rate_review</span>
              Write a Review
            </button>
          )}

          {reviews.length > 0 ? (
            <GlassCard className="p-6">
              <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5">
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar src={r.user?.avatar_url} username={r.user?.username} size="sm" />
                        <div>
                          <p className="font-lexend font-semibold text-sm text-white leading-none">{r.user?.username}</p>
                          <p className="text-[10px] text-white/30 font-lexend mt-1">{formatRelative(r.created_at)}</p>
                        </div>
                      </div>
                      {r.overall_rating && <StarRating value={r.overall_rating} />}
                    </div>
                    {r.body && <p className="text-sm text-white/60 leading-relaxed pl-9">{r.body}</p>}
                    {(r.atmosphere_score || r.food_score || r.safety_score) && (
                      <div className="flex gap-4 mt-3 pl-9">
                        {r.atmosphere_score && (
                          <span className="text-[10px] font-lexend font-bold uppercase tracking-wide text-white/30">
                            Atmos <span className="text-primary-container">{r.atmosphere_score}</span>
                          </span>
                        )}
                        {r.food_score && (
                          <span className="text-[10px] font-lexend font-bold uppercase tracking-wide text-white/30">
                            Food <span className="text-primary-container">{r.food_score}</span>
                          </span>
                        )}
                        {r.safety_score && (
                          <span className="text-[10px] font-lexend font-bold uppercase tracking-wide text-white/30">
                            Safety <span className="text-primary-container">{r.safety_score}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-white/15 block mb-3">reviews</span>
              <p className="text-white/30 text-sm font-lexend">No reviews yet. Be the first!</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── TRANSPORT & INFO ───────────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="space-y-5">
          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">directions_bus</span>
              Transport & Arrival
            </h2>
            <div className="space-y-3">
              {[
                { icon: 'directions_bus',    title: 'Official Shuttle', status: 'Active',  detail: 'Runs from designated fan zones. Last shuttle 90 min after final whistle.' },
                { icon: 'directions_subway', title: 'Public Transit',   status: 'Active',  detail: 'Extended service hours on match days. Check local transit authority for routes.' },
                { icon: 'local_parking',     title: 'Official Parking', status: 'Limited', detail: 'Pre-booking required. Lots open 3 hrs before kickoff via official app.' },
              ].map(({ icon, title, status, detail }) => (
                <div key={title} className="flex gap-4 p-4 bg-white/4 rounded-xl border-l-2 border-primary-container/60">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg text-primary-container">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-lexend font-bold text-xs uppercase tracking-wide text-white">{title}</p>
                      <span className={`text-[9px] font-lexend font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        status === 'Active'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">gpp_maybe</span>
              Safety & Protocols
            </h2>
            <div className="flex items-center gap-4 p-4 bg-white/4 rounded-xl mb-4">
              <span className="material-symbols-outlined text-4xl text-primary-container">inventory_2</span>
              <div>
                <p className="text-sm font-lexend font-black text-white uppercase tracking-wide">Clear Bag Only</p>
                <p className="text-xs text-white/45 mt-0.5">Max size: 12" × 6" × 12"</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-red-950/25 border border-red-500/25 rounded-xl text-center">
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/50 mb-1">Medical</p>
                <p className="font-lexend font-black text-2xl text-red-400">911</p>
              </div>
              <div className="p-4 bg-white/4 border border-white/10 rounded-xl text-center">
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/50 mb-1">Venue SOS</p>
                <p className="font-lexend font-black text-2xl text-white">#555</p>
              </div>
            </div>
            {stadium.security_score != null && (
              <div className="mt-4 pt-4 border-t border-white/6">
                {/* security_score already guarded by != null check above */}
                <ProgressBar value={stadium.security_score * 20} label="Security Score" showLabel />
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-lexend font-bold uppercase text-[11px] tracking-widest text-white/40 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">info</span>
              Venue Info
            </h2>
            <div className="space-y-3">
              {[
                { icon: 'stadium',        label: 'Capacity', value: stadium.capacity?.toLocaleString() ?? '—'  },
                { icon: 'calendar_month', label: 'Opened',   value: stadium.year_opened?.toString() ?? '—'     },
                { icon: 'location_on',    label: 'City',     value: `${stadium.city}, ${stadium.country}`      },
                { icon: 'grass',          label: 'Surface',  value: stadium.surface ?? '—'                     },
                { icon: 'wb_sunny',       label: 'Roof',     value: stadium.roof_type ?? '—'                   },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base text-white/25">{icon}</span>
                    <span className="text-xs font-lexend font-bold uppercase tracking-wide text-white/40">{label}</span>
                  </div>
                  <span className="text-sm font-lexend font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </PageWrapper>
  )
}