// src/components/events/EventCard.tsx

import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { NeonButton } from '@/components/ui/NeonButton'
import { useJoinEvent, useLeaveEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { mutate: join, isPending: joining } = useJoinEvent()
  const { mutate: leave, isPending: leaving } = useLeaveEvent()

  const handleJoin = () => {
    join(event.id)
    // For virtual events with a link, open in new tab after joining
    if (event.type === 'virtual' && event.link) {
      // Small delay so optimistic update applies first
      setTimeout(() => window.open(event.link!, '_blank', 'noopener,noreferrer'), 300)
    }
  }

  const handleLeave = () => leave(event.id)

  const isVirtual = event.type === 'virtual'
  const isPhysical = event.type === 'physical'

  const typeBadgeClass = isVirtual
    ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    : 'text-primary-container border-primary-container/30 bg-primary-container/10'

  const startDate = event.starts_at ? format(new Date(event.starts_at), 'MMM d, yyyy — h:mm a') : ''

  return (
    <div className={`glass-card rounded-xl p-4 flex flex-col gap-3 border ${
      isVirtual ? 'border-blue-400/20' : 'border-primary-container/20'
    }`}>
      {/* Type badge */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-lexend font-black uppercase tracking-widest border px-2 py-0.5 rounded-sm ${typeBadgeClass}`}>
          {isVirtual ? t('events.virtual') : t('events.physical')}
        </span>
        {/* Attendee count */}
        <span className="text-[10px] font-lexend text-white/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-[11px]">group</span>
          {event.attendee_count ?? 0} / {event.max_attendees}
        </span>
      </div>

      {/* Event name */}
      <p className="font-lexend font-bold text-sm text-white/90 line-clamp-1">
        {event.name}
      </p>

      {/* Description */}
      {event.description && (
        <p className="font-lexend text-[11px] text-white/40 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Match info */}
      {event.match && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
          {event.match.home_team.flag_url && (
            <img
              src={event.match.home_team.flag_url}
              alt={event.match.home_team.name}
              className="w-5 h-auto rounded-sm"
            />
          )}
          <span className="text-[11px] font-lexend font-bold text-white/60">
            {event.match.home_team.name}
          </span>
          <span className="text-[10px] font-lexend text-white/30">vs</span>
          <span className="text-[11px] font-lexend font-bold text-white/60">
            {event.match.away_team.name}
          </span>
          {event.match.away_team.flag_url && (
            <img
              src={event.match.away_team.flag_url}
              alt={event.match.away_team.name}
              className="w-5 h-auto rounded-sm"
            />
          )}
          <span className="ml-auto text-[10px] font-lexend text-white/30">
            {format(new Date(event.match.kickoff_at), 'MMM d, h:mm a')}
          </span>
        </div>
      )}

      {/* Date/time */}
      <div className="flex items-center gap-1.5 text-white/40">
        <span className="material-symbols-outlined text-[13px]">calendar_today</span>
        <span className="text-[11px] font-lexend">{startDate}</span>
      </div>

      {/* Location or Link */}
      <div className="flex items-center gap-1.5 text-white/40">
        <span className="material-symbols-outlined text-[13px]">
          {isVirtual ? 'link' : 'location_on'}
        </span>
        {isVirtual && event.link ? (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-lexend text-primary-container hover:underline truncate"
          >
            {t('events.joinLink')}
          </a>
        ) : (
          <span className="text-[11px] font-lexend truncate">
            {event.location || (isPhysical ? t('events.tbd') : '—')}
          </span>
        )}
      </div>

      {/* Host */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <div className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
          {event.host?.avatar_url ? (
            <img src={event.host.avatar_url} alt={event.host.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] font-lexend font-black text-white/40 uppercase">
              {event.host?.username?.[0] ?? '?'}
            </span>
          )}
        </div>
        <span className="text-[11px] font-lexend text-white/40">
          {t('events.hostedBy')} <span className="text-white/70">{event.host?.username ?? '—'}</span>
        </span>
      </div>

      {/* Action */}
      <div className="mt-auto pt-1">
        {user ? (
          event.is_joined ? (
            <NeonButton
              variant="outline"
              size="sm"
              className="w-full justify-center"
              disabled={leaving}
              onClick={handleLeave}
            >
              {leaving ? t('events.leaving') : t('events.leave')}
            </NeonButton>
          ) : (
            <NeonButton
              size="sm"
              className="w-full justify-center"
              disabled={joining}
              onClick={handleJoin}
            >
              {joining ? t('events.joining') : t('events.join')}
            </NeonButton>
          )
        ) : (
          <p className="text-center text-[11px] font-lexend text-white/30 py-1">
            {t('events.signInToJoin')}
          </p>
        )}
      </div>
    </div>
  )
}