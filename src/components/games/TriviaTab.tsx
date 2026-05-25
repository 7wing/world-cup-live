// src/components/games/TriviaTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Trivia questions with answer feedback + live session score tracker sidebar.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { glassStyle, capStyle, LiveDot } from '../../shared/ui'
import { TRIVIA_QUESTIONS } from '../../lib/fanzoneData'

const TOTAL_PTS = TRIVIA_QUESTIONS.reduce((sum, q) => sum + q.pts, 0)

export function TriviaTab() {
  // answers: { [questionId]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [score, setScore] = useState(0)

  const answer = (qid: string, idx: number, correct: number, pts: number) => {
    if (answers[qid] !== undefined) return
    setAnswers((prev) => ({ ...prev, [qid]: idx }))
    if (idx === correct) setScore((s) => s + pts)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
      {/* ── Questions ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {TRIVIA_QUESTIONS.map((q) => {
          const picked = answers[q.id] ?? null

          return (
            <div
              key={q.id}
              className="fade-up"
              style={{ ...glassStyle, overflow: 'hidden' }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {q.live ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'var(--primary-dim)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: 10,
                      padding: '2px 8px',
                    }}
                  >
                    <LiveDot />
                    <span style={{ ...capStyle, color: 'var(--primary)', fontSize: 8 }}>
                      {q.tag}
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      ...capStyle,
                      fontSize: 8,
                      color: 'var(--t4)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {q.tag}
                  </span>
                )}
                <span
                  style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)' }}
                >
                  +{q.pts} pts
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: 16 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  {q.question}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 7,
                  }}
                >
                  {q.options.map((opt, i) => {
                    const isCorrect = picked !== null && i === q.answer
                    const isWrong = picked === i && i !== q.answer

                    return (
                      <button
                        key={i}
                        onClick={() => answer(q.id, i, q.answer, q.pts)}
                        style={{
                          textAlign: 'left',
                          padding: '9px 11px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          transition: 'all 0.15s',
                          cursor: picked !== null ? 'default' : 'pointer',
                          background: isCorrect
                            ? 'var(--primary-dim)'
                            : isWrong
                              ? 'var(--red-dim)'
                              : picked !== null
                                ? 'transparent'
                                : 'var(--surface-hi)',
                          border: `1px solid ${
                            isCorrect
                              ? 'var(--primary-border)'
                              : isWrong
                                ? 'rgba(255,78,78,0.3)'
                                : picked !== null
                                  ? 'var(--border-soft)'
                                  : 'var(--border)'
                          }`,
                          color: isCorrect
                            ? 'var(--primary)'
                            : isWrong
                              ? 'var(--red)'
                              : picked !== null
                                ? 'var(--t4)'
                                : 'var(--t2)',
                        }}
                      >
                        <span style={{ marginRight: 5, opacity: 0.4 }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                        {isCorrect ? ' ✓' : ''}
                        {isWrong ? ' ✗' : ''}
                      </button>
                    )
                  })}
                </div>

                {picked !== null && (
                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      marginTop: 10,
                      color:
                        picked === q.answer ? 'var(--primary)' : 'var(--red)',
                    }}
                  >
                    {picked === q.answer
                      ? `Correct! +${q.pts} pts`
                      : 'Incorrect — no points'}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Score sidebar ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Score card */}
        <div style={{ ...glassStyle, padding: 20, textAlign: 'center' }}>
          <p style={{ ...capStyle, color: 'var(--t4)', marginBottom: 8 }}>
            Session Score
          </p>
          <p
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: 'var(--primary)',
              lineHeight: 1,
            }}
          >
            {score}
          </p>
          <p style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>pts earned</p>

          {/* Progress bar */}
          <div
            style={{
              marginTop: 14,
              height: 3,
              background: 'var(--border)',
              borderRadius: 2,
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--primary)',
                borderRadius: 2,
                width: `${Math.min(100, (score / TOTAL_PTS) * 100)}%`,
                transition: 'width 0.4s',
              }}
            />
          </div>
          <p style={{ fontSize: 9, color: 'var(--t4)', marginTop: 5 }}>
            {TOTAL_PTS} pts available
          </p>
        </div>

        {/* Progress tracker */}
        <div style={{ ...glassStyle, padding: 16 }}>
          <p style={{ ...capStyle, color: 'var(--t4)', marginBottom: 10 }}>
            Progress
          </p>
          {TRIVIA_QUESTIONS.map((q) => {
            const a = answers[q.id]
            return (
              <div
                key={q.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  opacity: a === undefined ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: 12 }}>
                  {a === undefined ? '⬜' : a === q.answer ? '✅' : '❌'}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--t2)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {q.tag}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: a === q.answer ? 'var(--primary)' : 'var(--t4)',
                  }}
                >
                  {a === undefined ? '—' : a === q.answer ? `+${q.pts}` : '+0'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}