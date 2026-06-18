// src/components/events/HostEventModal.tsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { NeonButton } from '@/components/ui/NeonButton'
import { useCreateEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/authStore'
import { fetchMatches } from '@/api/matches'
import type { Match } from '@/types'

interface HostEventModalProps {
  onClose: () => void
}

type EventType = 'virtual' | 'physical'

export function HostEventModal({ onClose }: HostEventModalProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { mutate: create, isPending } = useCreateEvent()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventType>('virtual')
  const [location, setLocation] = useState('')
  const [link, setLink] = useState('')
  const [matchId, setMatchId] = useState<string>('')
  const [maxAttendees, setMaxAttendees] = useState(50)
  const [startsAt, setStartsAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  })

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('events.errors.nameRequired')
    if (name.trim().length > 80) errs.name = t('events.errors.nameTooLong')
    if (description.length > 280) errs.description = t('events.errors.descriptionTooLong')
    if (type === 'physical' && !location.trim()) errs.location = t('events.errors.locationRequired')
    if (type === 'virtual' && !link.trim()) errs.link = t('events.errors.linkRequired')
    if (!startsAt) errs.startsAt = t('events.errors.startTimeRequired')
    if (startsAt) {
      const d = new Date(startsAt)
      if (d <= new Date()) errs.startsAt = t('events.errors.mustBeFuture')
    }
    if (maxAttendees < 2 || maxAttendees > 500) errs.maxAttendees = t('events.errors.maxAttendeesRange')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !user) return
    setErrors({})

    create({
      name: name.trim(),
      description: description.trim() || null,
      type,
      location: type === 'physical' ? location.trim() : null,
      link: type === 'virtual' ? link.trim() : null,
      match_id: matchId || null,
      created_by: user.id,
      max_attendees: maxAttendees,
      starts_at: new Date(startsAt).toISOString(),
    }, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  const matchOptions = matches.filter((m: Match) => m.status === 'upcoming' || m.status === 'live')

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[10px] flex items-center justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] glass-card rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="font-lexend font-black text-sm uppercase tracking-widest text-white/80">
            {t('events.hostEvent')}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Event Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.eventName')} *
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder={t('events.namePlaceholder')}
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors"
          />
          {errors.name && <p className="text-red-400 text-[10px] font-lexend">{errors.name}</p>}
          <p className="text-[9px] font-lexend text-white/20 text-right">{name.length}/80</p>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder={t('events.descriptionPlaceholder')}
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors resize-none"
          />
          {errors.description && <p className="text-red-400 text-[10px] font-lexend">{errors.description}</p>}
          <p className="text-[9px] font-lexend text-white/20 text-right">{description.length}/280</p>
        </div>

        {/* Type toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.type')}
          </label>
          <div className="flex gap-0.5 bg-white/[0.03] rounded-[20px] p-[3px] border border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setType('virtual')}
              className={`px-3.5 py-[5px] rounded-2xl text-[10px] font-lexend font-black uppercase tracking-widest border-none transition-all cursor-pointer ${
                type === 'virtual'
                  ? 'bg-blue-400/10 text-blue-400'
                  : 'bg-transparent text-white/30 hover:text-white/50'
              }`}
            >
              {t('events.virtual')}
            </button>
            <button
              type="button"
              onClick={() => setType('physical')}
              className={`px-3.5 py-[5px] rounded-2xl text-[10px] font-lexend font-black uppercase tracking-widest border-none transition-all cursor-pointer ${
                type === 'physical'
                  ? 'bg-primary-container/10 text-primary-container'
                  : 'bg-transparent text-white/30 hover:text-white/50'
              }`}
            >
              {t('events.physical')}
            </button>
          </div>
        </div>

        {/* Location (physical) */}
        {type === 'physical' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
              {t('events.location')} *
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('events.locationPlaceholder')}
              className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors"
            />
            {errors.location && <p className="text-red-400 text-[10px] font-lexend">{errors.location}</p>}
          </div>
        )}

        {/* Link (virtual) */}
        {type === 'virtual' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
              {t('events.link')} *
            </label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t('events.linkPlaceholder')}
              className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors"
            />
            {errors.link && <p className="text-red-400 text-[10px] font-lexend">{errors.link}</p>}
          </div>
        )}

        {/* Match select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.match')}
          </label>
          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-surface-container text-white/60">
              {t('events.noSpecificMatch')}
            </option>
            {matchOptions.map((m: Match) => (
              <option key={m.id} value={m.id} className="bg-surface-container text-white/80">
                {m.home_team.name} vs {m.away_team.name} — {format(new Date(m.kickoff_at), 'MMM d')}
              </option>
            ))}
          </select>
        </div>

        {/* Max Attendees */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.maxAttendees')}
          </label>
          <input
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(Number(e.target.value))}
            min={2}
            max={500}
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 outline-none transition-colors"
          />
          {errors.maxAttendees && <p className="text-red-400 text-[10px] font-lexend">{errors.maxAttendees}</p>}
        </div>

        {/* Starts At */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-lexend font-black uppercase tracking-widest text-white/30">
            {t('events.startsAt')} *
          </label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-xl px-4 py-3 text-sm font-lexend text-white/80 outline-none transition-colors"
          />
          {errors.startsAt && <p className="text-red-400 text-[10px] font-lexend">{errors.startsAt}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 flex-shrink-0">
          <NeonButton variant="outline" className="flex-1 justify-center text-[10px] py-2" onClick={onClose}>
            {t('common.cancel')}
          </NeonButton>
          <NeonButton
            className="flex-1 justify-center text-[10px] py-2"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? t('events.hosting') : t('events.hostEvent')}
          </NeonButton>
        </div>
      </div>
    </div>
  )
}