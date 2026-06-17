// src/pages/MatchesPage.tsx
// Year selection is hoisted here so it survives tab switches.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BracketTab } from '@/components/matches/BracketTab'
import { GroupsTab } from '@/components/matches/GroupsTab'
import { ScheduleTab } from '@/components/matches/ScheduleTab'
import type { TournamentYear } from '@/utils/tournament'

// ─────────────────────────────────────────────────────────────────────────────
type Tab = 'schedule' | 'groups' | 'bracket'

const TABS: { id: Tab; labelKey: string; icon: string }[] = [
  { id: 'schedule', labelKey: 'matches.schedule', icon: 'calendar_month' },
  { id: 'groups',   labelKey: 'matches.groups',   icon: 'grid_view'      },
  { id: 'bracket',  labelKey: 'matches.bracket',  icon: 'account_tree'   },
]

// ─────────────────────────────────────────────────────────────────────────────
export function MatchesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const [year, setYear] = useState<TournamentYear>(2026)

  return (
    <PageWrapper>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/8 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 pb-3 pt-1
              text-[11px] font-lexend font-bold uppercase tracking-widest
              border-b-2 transition-all whitespace-nowrap flex-shrink-0
              ${activeTab === tab.id
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-white/30 hover:text-white/60'}
            `}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* ══ SCHEDULE ══ */}
      {activeTab === 'schedule' && <ScheduleTab year={year} onYearChange={setYear} />}

      {/* ══ GROUPS ══ */}
      {activeTab === 'groups' && <GroupsTab year={year} onYearChange={setYear} />}

      {/* ══ BRACKET ══ */}
      {activeTab === 'bracket' && <BracketTab year={year} onYearChange={setYear} />}
    </PageWrapper>
  )
}