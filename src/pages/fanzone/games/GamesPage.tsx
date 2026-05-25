// src/pages/GamesPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full Games page: tab bar + tab content (Oracle, Trivia, MiniLeague, Duel,
// Bracket placeholder).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { LiveDot, glassStyle } from '@/shared/ui'
import { OracleTab } from '@/components/games/OracleTab'
import { TriviaTab } from '@/components/games/TriviaTab'
import { MiniLeagueTab } from '@/components/games/MiniLeagueTab'
import { DuelTab } from '@/components/games/DuelTab'
import { GAME_TABS } from '@/lib/fanzoneData'
import type { GameTabId } from '@/lib/fanzoneData'

export function GamesPage() {
  const [tab, setTab] = useState<GameTabId>('oracle')

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 100px' }}>
      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <LiveDot />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Live Fan Games Hub
        </span>
      </div>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 52,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          fontStyle: 'italic',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        Games
      </h1>
      <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 28 }}>
        Earn points every matchday — Oracle predictions, trivia, duels &amp; rankings.
      </p>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          borderBottom: '1px solid var(--border-soft)',
          marginBottom: 28,
          overflowX: 'auto',
        }}
      >
        {GAME_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px 12px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
              color: tab === t.id ? 'var(--primary)' : 'var(--t3)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            } as React.CSSProperties}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fade-up" key={tab}>
        {tab === 'oracle'  && <OracleTab />}
        {tab === 'trivia'  && <TriviaTab />}
        {tab === 'league'  && <MiniLeagueTab />}
        {tab === 'duel'    && <DuelTab />}
        {tab === 'bracket' && (
          <div
            style={{
              ...glassStyle,
              padding: 60,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 48, marginBottom: 16 }}>🗂️</p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--t3)',
                marginBottom: 8,
              }}
            >
              Bracket Predictor
            </p>
            <p style={{ fontSize: 13, color: 'var(--t4)' }}>
              Coming once the group stage concludes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}