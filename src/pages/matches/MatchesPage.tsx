// src/pages/MatchesPage.tsx

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BracketTab } from '@/components/matches/BracketTab'
import { GroupsTab } from '@/components/matches/GroupsTab'
import { ScheduleTab } from '@/components/matches/ScheduleTab'

// ─────────────────────────────────────────────────────────────────────────────
type Tab = 'schedule' | 'groups' | 'bracket'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
  { id: 'groups',   label: 'Groups',   icon: 'grid_view'      },
  { id: 'bracket',  label: 'Bracket',  icon: 'account_tree'   },
]

// ─────────────────────────────────────────────────────────────────────────────
export function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule')

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
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ SCHEDULE ══ */}
      {activeTab === 'schedule' && <ScheduleTab />}

      {/* ══ GROUPS ══ */}
      {activeTab === 'groups' && <GroupsTab />}

      {/* ══ BRACKET ══ */}
      {activeTab === 'bracket' && <BracketTab />}
    </PageWrapper>
  )
}