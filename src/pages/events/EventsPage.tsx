// src/pages/events/EventsPage.tsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LiveDot } from '@/components/ui/LiveDot'
import { NeonButton } from '@/components/ui/NeonButton'
import { EventCard } from '@/components/events/EventCard'
import { HostEventModal } from '@/components/events/HostEventModal'
import { useEvents } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types'

type FilterType = 'all' | 'virtual' | 'physical'

const FILTER_OPTIONS: { key: FilterType; labelKey: string }[] = [
  { key: 'all', labelKey: 'events.filter.all' },
  { key: 'virtual', labelKey: 'events.filter.virtual' },
  { key: 'physical', labelKey: 'events.filter.physical' },
]

function applyFilter(events: Event[], filter: FilterType): Event[] {
  if (filter === 'all') return events
  return events.filter((e) => e.type === filter)
}

export function EventsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const [showHostModal, setShowHostModal] = useState(false)

  const { data: events = [], isLoading } = useEvents()

  const displayed = applyFilter(events, filter)

  const handleHostClick = () => {
    if (user) {
      setShowHostModal(true)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <LiveDot />
        <span className="text-[11px] font-lexend font-black text-primary-container uppercase tracking-widest">
          {t('common.live')}
        </span>
      </div>
      <div className="flex items-start justify-between mb-6">
        <h1 className="font-lexend font-black text-5xl uppercase italic leading-none">
          {t('events.title')}
        </h1>
        <NeonButton size="sm" onClick={handleHostClick} className="mt-1">
          {t('events.hostEvent')}
        </NeonButton>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0.5 bg-white/[0.03] rounded-[20px] p-[3px] border border-white/10 w-fit mb-6">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`
              px-3.5 py-[5px] rounded-2xl text-[10px] font-lexend font-black
              uppercase tracking-widest border-none transition-all cursor-pointer
              ${filter === f.key
                ? 'bg-primary-container/10 text-primary-container'
                : 'bg-transparent text-white/30 hover:text-white/50'
              }
            `}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!isLoading && displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <span className="material-symbols-outlined text-5xl text-white/20">event</span>
          <p className="font-lexend font-bold uppercase text-white/40 text-sm">
            {filter === 'all' ? t('events.empty') : t('events.emptyFiltered')}
          </p>
          {
            <NeonButton size="sm" onClick={handleHostClick} className="mt-2">
              {t('events.hostFirst')}
            </NeonButton>
          }
        </div>
      )}

      {showHostModal && <HostEventModal onClose={() => setShowHostModal(false)} />}
    </div>
  )
}