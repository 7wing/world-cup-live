// src/components/games/OracleTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fan Oracle — 3-column poll cards. Vote to reveal live percentage bars.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { glassStyle, capStyle } from '../../shared/ui'
import { ORACLE_QUESTIONS } from '../../lib/fanzoneData'

export function OracleTab() {
  // votes: { [questionId]: selectedOptionIndex }
  const [votes, setVotes] = useState<Record<string, number>>({})

  const vote = (qid: string, idx: number) => {
    if (votes[qid] !== undefined) return
    setVotes((prev) => ({ ...prev, [qid]: idx }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {ORACLE_QUESTIONS.map((q) => {
        const picked = votes[q.id]
        // Optimistically add 1 to the voted option's count
        const displayVotes =
          picked !== undefined
            ? q.votes.map((v, i) => (i === picked ? v + 1 : v))
            : q.votes
        const total = picked !== undefined ? q.total + 1 : q.total

        return (
          <div
            key={q.id}
            className="fade-up"
            style={{ ...glassStyle, overflow: 'hidden' }}
          >
            {/* Card header */}
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ ...capStyle, color: 'var(--t3)' }}>Fan Oracle</span>
              <span style={{ fontSize: 10, color: 'var(--t4)' }}>
                {total.toLocaleString()} votes
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: 16 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.55,
                  marginBottom: 14,
                }}
              >
                {q.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {q.options.map((opt, i) => {
                  const pct = Math.round((displayVotes[i] / total) * 100)
                  const selected = picked === i

                  return (
                    <button
                      key={i}
                      onClick={() => vote(q.id, i)}
                      disabled={picked !== undefined}
                      style={{
                        position: 'relative',
                        textAlign: 'left',
                        padding: '9px 12px',
                        borderRadius: 9,
                        border: `1px solid ${selected ? 'var(--primary-border)' : 'var(--border-soft)'}`,
                        background: 'transparent',
                        overflow: 'hidden',
                        cursor: picked !== undefined ? 'default' : 'pointer',
                      }}
                    >
                      {/* Percentage fill */}
                      {picked !== undefined && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: `${pct}%`,
                            background: selected
                              ? 'rgba(0,255,65,0.12)'
                              : 'rgba(255,255,255,0.03)',
                            transition: 'width 0.5s ease',
                            borderRadius: 9,
                          }}
                        />
                      )}

                      {/* Label + pct */}
                      <div
                        style={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: selected ? 'var(--primary)' : 'var(--t2)',
                          }}
                        >
                          {opt}
                        </span>
                        {picked !== undefined && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: selected ? 'var(--primary)' : 'var(--t4)',
                            }}
                          >
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {picked === undefined && (
                <p
                  style={{
                    fontSize: 10,
                    color: 'var(--t4)',
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                >
                  Vote to see results
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}