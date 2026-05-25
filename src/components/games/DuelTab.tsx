// src/components/games/DuelTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fan Duel — challenge opponents + live head-to-head question, record sidebar.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { glassStyle, capStyle, LiveDot } from '../../shared/ui'
import { DUEL_OPPONENTS } from '../../lib/fanzoneData'

const DUEL_QUESTION = {
  question:
    'Which team holds the record for most consecutive wins in a single World Cup?',
  options: ['Germany 2014', 'France 1998', 'Brazil 1970', 'Italy 1982'],
}

const RECENT_DUELS = [
  { opp: 'SambaMaster', result: 'W', score: '3–1', pts: '+80' },
  { opp: 'TacticoX', result: 'W', score: '3–2', pts: '+60' },
  { opp: 'GoalKing', result: 'L', score: '1–3', pts: '-40' },
  { opp: 'EuroFanatic', result: 'W', score: '3–0', pts: '+100' },
]

export function DuelTab() {
  const [challenged, setChallenged] = useState<string | null>(null)
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
      {/* ── Left column ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Opponent list */}
        <div style={{ ...glassStyle, overflow: 'hidden' }}>
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚔️</span>
            <span style={{ ...capStyle, color: 'var(--t3)' }}>Challenge a Fan</span>
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
              Head-to-head trivia duels. First to 3 correct answers wins.
            </p>

            {DUEL_OPPONENTS.map((opp) => (
              <div
                key={opp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface-hi)',
                  borderRadius: 10,
                  border: '1px solid var(--border-soft)',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--primary-dim)',
                    border: '1px solid var(--primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {opp.flag}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{opp.name}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                    <span
                      style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}
                    >
                      {opp.pts.toLocaleString()} pts
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--t3)' }}>
                      🔥 {opp.streak}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--t3)' }}>
                      {opp.record}
                    </span>
                  </div>
                </div>

                {/* Duel button */}
                <button
                  onClick={() =>
                    setChallenged((prev) => (prev === opp.id ? null : opp.id))
                  }
                  style={{
                    padding: '6px 14px',
                    borderRadius: 16,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    background:
                      challenged === opp.id ? 'var(--primary-dim)' : 'transparent',
                    color:
                      challenged === opp.id ? 'var(--primary)' : 'var(--t3)',
                    border: `1px solid ${
                      challenged === opp.id
                        ? 'var(--primary-border)'
                        : 'var(--border)'
                    }`,
                    transition: 'all 0.15s',
                  }}
                >
                  {challenged === opp.id ? 'Challenged!' : 'Duel'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live duel card */}
        <div
          style={{
            ...glassStyle,
            overflow: 'hidden',
            borderColor: 'var(--primary-border)',
            background:
              'linear-gradient(135deg, rgba(0,255,65,0.04) 0%, transparent 60%)',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <LiveDot />
              <span style={{ ...capStyle, color: 'var(--primary)' }}>Live Duel</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--t4)' }}>First to 3 wins</span>
          </div>

          <div style={{ padding: 20 }}>
            {/* Score */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 32,
                marginBottom: 22,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  2
                </p>
                <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>You</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--t4)', fontWeight: 800 }}>vs</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: 'var(--t3)',
                    lineHeight: 1,
                  }}
                >
                  1
                </p>
                <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
                  FootballNerd99
                </p>
              </div>
            </div>

            {/* Question */}
            <div
              style={{
                background: 'var(--surface-hi)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  ...capStyle,
                  color: 'var(--primary)',
                  fontSize: 8,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Question 4 / 5
              </span>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.55 }}>
                {DUEL_QUESTION.question}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DUEL_QUESTION.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${
                      picked === i ? 'var(--primary-border)' : 'var(--border-soft)'
                    }`,
                    background: picked === i ? 'var(--primary-dim)' : 'var(--surface-hi)',
                    color: picked === i ? 'var(--primary)' : 'var(--t2)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {picked !== null && (
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--primary)',
                }}
              >
                Answer submitted! ✓
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Win/loss record */}
        <div style={{ ...glassStyle, padding: 20 }}>
          <p style={{ ...capStyle, color: 'var(--t4)', marginBottom: 14 }}>
            Your Record
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 28,
              marginBottom: 14,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: 'var(--primary)',
                  lineHeight: 1,
                }}
              >
                12
              </p>
              <p style={{ ...capStyle, fontSize: 8, color: 'var(--t4)', marginTop: 4 }}>
                Wins
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: 'var(--t3)',
                  lineHeight: 1,
                }}
              >
                4
              </p>
              <p style={{ ...capStyle, fontSize: 8, color: 'var(--t4)', marginTop: 4 }}>
                Losses
              </p>
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div
              style={{
                height: '100%',
                background: 'var(--primary)',
                borderRadius: 2,
                width: '75%',
              }}
            />
          </div>
          <p
            style={{
              fontSize: 10,
              color: 'var(--primary)',
              textAlign: 'center',
              marginTop: 6,
              fontWeight: 700,
            }}
          >
            75% win rate
          </p>
        </div>

        {/* Recent duels */}
        <div style={{ ...glassStyle, overflow: 'hidden' }}>
          <div
            style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-soft)' }}
          >
            <span style={{ ...capStyle, color: 'var(--t4)' }}>Recent Duels</span>
          </div>
          {RECENT_DUELS.map((d, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderBottom:
                  i < RECENT_DUELS.length - 1 ? '1px solid var(--border-soft)' : 'none',
                fontSize: 12,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  width: 14,
                  color: d.result === 'W' ? 'var(--primary)' : 'var(--red)',
                }}
              >
                {d.result}
              </span>
              <span
                style={{
                  flex: 1,
                  color: 'var(--t2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.opp}
              </span>
              <span style={{ color: 'var(--t4)', marginRight: 4 }}>{d.score}</span>
              <span
                style={{
                  fontWeight: 800,
                  color: d.pts.startsWith('+') ? 'var(--primary)' : 'var(--red)',
                }}
              >
                {d.pts}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}