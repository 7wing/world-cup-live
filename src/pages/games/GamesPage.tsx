// src/pages/games/GamesPage.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { TriviaTab } from '@/components/games/TriviaTab'
import { BracketTab } from '@/components/matches/BracketTab'
import { useMatches, usePredictionsForMatches, useSubmitMatchPrediction } from '@/hooks/useMatches'
import { useAuthStore } from '@/store/authStore'
import { fetchGeminiTrivia, isGeminiEnabled } from '@/lib/gemini'
import { fetchTribes } from '@/api/fanzone'
import {
  fetchPotentialOpponents,
  fetchUserDuelStats,
  fetchRecentDuels,
  fetchActiveDuel,
  fetchIncomingChallenges,
  createDuelChallenge,
  acceptDuel,
  rejectDuel,
  fetchTriviaQuestions,
  type DuelStats,
  type RecentDuel,
  type IncomingChallenge,
} from '@/api/games'
import { formatKickoff } from '@/utils/formatDate'
import type { Match, TriviaQuestion } from '@/types'

// ── Tab definition ─────────────────────────────────────────────────────────────
type GameTab = 'trivia' | 'predictor' | 'bracket' | 'duel'

const GAME_TABS: { id: GameTab; labelKey: string; icon: string }[] = [
  { id: 'trivia',    labelKey: 'games.aiTrivia', icon: 'psychology'   },
  { id: 'predictor', labelKey: 'games.predictor', icon: 'auto_awesome' },
  { id: 'bracket',   labelKey: 'matches.bracket',   icon: 'account_tree' },
  { id: 'duel',      labelKey: 'games.fanDuel',  icon: 'swords'       },
]

function matchLabel(m: Match, side: 'home' | 'away') {
  const team = side === 'home' ? m.home_team : m.away_team
  const flag = team.flag_url && !team.flag_url.startsWith('http') ? team.flag_url : ''
  return `${flag} ${team.name}`.trim()
}

// ── AI Trivia wrapper (fetches Gemini live question, passes to TriviaTab) ─────
function AiTriviaWrapper() {
  const { data: matches } = useMatches()
  const liveMatch = matches?.find((m) => m.status === 'live')

  const [geminiQuestion, setGeminiQuestion] = useState<TriviaQuestion | null>(null)

  useEffect(() => {
    if (!isGeminiEnabled()) return
    const matchId = liveMatch?.id
    fetchGeminiTrivia(liveMatch).then((q) => {
      if (!q) return
      setGeminiQuestion({
        id:         'gemini-live',
        question:   q.question,
        options:    q.options,
        answer:     q.answer,
        points:     q.points,
        tag:        liveMatch ? 'AI · Live Match' : 'AI · World Cup',
        difficulty: 'medium',
        source:     'gemini',
        match_id:   matchId ?? null,
        created_at: new Date().toISOString(),
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMatch?.id])

  // Tribe Battleground sidebar
  const { data: tribes = [] } = useQuery({
    queryKey: ['tribes'],
    queryFn:  fetchTribes,
    staleTime: 60_000,
  })
  const topTribes = tribes.slice(0, 4)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8">
        <TriviaTab matchId={liveMatch?.id} liveQuestion={geminiQuestion} />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-container">shield</span>
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
              Tribe Battleground
            </p>
          </div>
          {topTribes.length > 0 ? (
            <div className="divide-y divide-white/5">
              {topTribes.map((tribe, idx) => (
                <div key={tribe.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-lexend font-black text-base text-primary-container italic w-6">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="font-lexend font-semibold text-xs text-white/70">{tribe.name}</p>
                    <p className="text-[10px] text-white/30 font-lexend">
                      {tribe.total_points.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-[11px] font-lexend text-white/20">No tribes yet</p>
          )}
          <div className="p-4 pt-3">
            <NeonButton variant="outline" className="w-full justify-center">
              Join a Tribe
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ── Score Predictor tab ────────────────────────────────────────────────────────
function PredictorTab() {
  const navigate  = useNavigate()
  const { data: matches } = useMatches()
  const { user }          = useAuthStore()
  const upcoming          = (matches ?? []).filter((m) => m.status === 'upcoming').slice(0, 6)
  const matchIds          = upcoming.map((m) => m.id)

  const { data: saved = [] }          = usePredictionsForMatches(user?.id, matchIds)
  const { mutate: lockIn, isPending } = useSubmitMatchPrediction()

  // Initialize scores from saved predictions
  const initialScores = (() => {
    const init: Record<string, [number, number]> = {}
    for (const p of saved) init[p.match_id] = [p.predicted_home, p.predicted_away]
    return init
  })()
  const [scores, setScores] = useState<Record<string, [number, number]>>(initialScores)

  const savedMap = new Map(saved.map((p) => [p.match_id, p]))

  function setScore(matchId: string, side: 0 | 1, val: number) {
    const cur  = scores[matchId] ?? [0, 0]
    const next = [...cur] as [number, number]
    next[side] = Math.max(0, val)
    setScores((prev) => ({ ...prev, [matchId]: next }))
  }

  function handleLockIn(matchId: string) {
    if (!user) return
    const [home, away] = scores[matchId] ?? [0, 0]
    lockIn({ user_id: user.id, match_id: matchId, predicted_home: home, predicted_away: away })
  }

  if (upcoming.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm font-lexend text-white/30">
          No upcoming matches to predict right now.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-xs font-lexend text-white/30 leading-relaxed">
        Predict the exact final score before kick-off. Exact score = 50 pts, correct result = 10 pts.
      </p>
      {upcoming.map((m) => {
        const isLocked  = savedMap.has(m.id)
        const savedPred = savedMap.get(m.id)
        const pred      = scores[m.id] ?? [0, 0]

        return (
          <GlassCard key={m.id} className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
              <span className="text-[10px] font-lexend text-white/25">
                {m.group_letter ? `Group ${m.group_letter}` : m.stage} · {formatKickoff(m.kickoff_at)}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-lexend font-black text-primary-container">
                <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                +50 pts exact
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              {/* Home */}
              <div className="flex-1 text-right">
                <p className="font-lexend font-semibold text-xs text-white/60 mb-2">
                  {matchLabel(m, 'home')}
                </p>
                <div className="flex items-center justify-end gap-2">
                  {!isLocked && (
                    <button
                      onClick={() => setScore(m.id, 0, pred[0] - 1)}
                      className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                  )}
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">
                    {pred[0]}
                  </span>
                  {!isLocked && (
                    <button
                      onClick={() => setScore(m.id, 0, pred[0] + 1)}
                      className="w-7 h-7 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container hover:bg-primary-container/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  )}
                </div>
              </div>

              <span className="font-lexend font-black text-xl text-white/15">–</span>

              {/* Away */}
              <div className="flex-1">
                <p className="font-lexend font-semibold text-xs text-white/60 mb-2">
                  {matchLabel(m, 'away')}
                </p>
                <div className="flex items-center gap-2">
                  {!isLocked && (
                    <button
                      onClick={() => setScore(m.id, 1, pred[1] - 1)}
                      className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                  )}
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">
                    {pred[1]}
                  </span>
                  {!isLocked && (
                    <button
                      onClick={() => setScore(m.id, 1, pred[1] + 1)}
                      className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lock button */}
              <button
                onClick={() => handleLockIn(m.id)}
                disabled={isLocked || isPending || !user}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest transition-colors flex-shrink-0 ${
                  isLocked
                    ? 'bg-primary-container/10 text-primary-container/40 border border-primary-container/10 cursor-default'
                    : !user
                      ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                      : 'bg-primary-container/20 text-primary-container border border-primary-container/30 hover:bg-primary-container/30'
                }`}
              >
                {isLocked ? 'Locked ✓' : !user ? 'Sign in' : 'Lock In'}
              </button>
            </div>

            {isLocked && savedPred && (
              <div className="px-4 pb-3 flex items-center justify-between">
                <p className="text-[10px] font-lexend text-white/20">
                  Your pick:{' '}
                  <span className="text-white/40 font-bold">
                    {savedPred.predicted_home}–{savedPred.predicted_away}
                  </span>
                </p>
                <button
                  onClick={() => navigate(`/matches/${m.id}`)}
                  className="text-[10px] font-lexend font-bold text-primary-container/60 hover:text-primary-container transition-colors flex items-center gap-0.5"
                >
                  View Oracle
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </button>
              </div>
            )}
          </GlassCard>
        )
      })}
      {!user && (
        <p className="text-[11px] font-lexend text-white/20 text-center">
          Sign in to lock in predictions and earn points.
        </p>
      )}
    </div>
  )
}

// ── Practice Duel Bot ──────────────────────────────────────────────────────────
function PracticeDuelBot() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [current, setCurrent]     = useState(0)
  const [userScore, setUserScore] = useState(0)
  const [botScore, setBotScore]   = useState(0)
  const [feedback, setFeedback]   = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [finished, setFinished]   = useState(false)
  const [botPick, setBotPick]     = useState<string | null>(null)

  const start = async () => {
    const qs = await fetchTriviaQuestions(5)
    setQuestions(qs)
    setCurrent(0)
    setUserScore(0)
    setBotScore(0)
    setFeedback('idle')
    setFinished(false)
    setBotPick(null)
  }

  const answer = (option: string) => {
    if (finished || feedback !== 'idle') return
    const q = questions[current]
    if (!q) return
    const isCorrect = option === q.correctAnswer
    if (isCorrect) setUserScore((s) => s + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    // bot picks a random option; 70% chance correct
    const botCorrect = Math.random() < 0.7
    const botAnswer  = botCorrect ? q.correctAnswer : q.options[Math.floor(Math.random() * q.options.length)]
    setBotPick(botAnswer)
    if (botAnswer === q.correctAnswer) setBotScore((s) => s + 1)
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true)
      } else {
        setCurrent((c) => c + 1)
        setFeedback('idle')
        setBotPick(null)
      }
    }, 1500)
  }

  if (questions.length === 0) {
    return (
      <div className="p-4 text-center space-y-3">
        <p className="text-[11px] font-lexend text-white/20">
          No opponent online? Practice against the bot.
        </p>
        <NeonButton onClick={start} variant="secondary">Start Practice Duel</NeonButton>
      </div>
    )
  }

  const q = questions[current]
  const message = finished
    ? userScore > botScore
      ? 'You win!'
      : userScore < botScore
        ? 'Bot wins.'
        : 'Draw.'
    : null

  return (
    <div className="p-4 space-y-3">
      {!finished && (
        <div className="flex items-center justify-between text-[10px] font-lexend text-white/30">
          <span>Q{current + 1}/{questions.length}</span>
          <span className="text-white/60">You {userScore} – Bot {botScore}</span>
        </div>
      )}
      {finished ? (
        <div className="text-center space-y-3">
          <p className={`font-lexend font-black text-xl ${userScore > botScore ? 'text-primary-container' : userScore < botScore ? 'text-red-400' : 'text-white/60'}`}>
            {message}
          </p>
          <p className="text-[11px] font-lexend text-white/20">Final score: You {userScore} – Bot {botScore}</p>
          <NeonButton onClick={start} variant="secondary">Play Again</NeonButton>
        </div>
      ) : (
        <>
          <p className="font-lexend font-semibold text-sm text-white/80">{q?.question}</p>
          <div className="space-y-2">
            {q?.options.map((opt) => {
              let extra = ''
              if (feedback !== 'idle') {
                if (opt === q.correctAnswer) extra = 'bg-green-500/15 border-green-500/30 text-white'
                else extra = 'opacity-40'
              }
              if (feedback !== 'idle' && opt === botPick) {
                extra = opt === q.correctAnswer ? 'bg-green-500/15 border-green-500/30 text-white' : 'bg-red-500/10 border-red-500/25 text-white/40'
              }
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={feedback !== 'idle'}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] font-lexend font-semibold transition-colors bg-white/3 border-white/5 hover:bg-white/5 ${extra}`}
                >
                  {opt} {feedback !== 'idle' && opt === botPick && <span className="text-[9px] text-white/20 ml-1">(bot)</span>}
                </button>
              )
            })}
          </div>
          {feedback === 'correct' && <p className="text-[10px] font-lexend text-green-400">Correct! {q?.explanation}</p>}
          {feedback === 'wrong' && <p className="text-[10px] font-lexend text-red-400">Wrong. {q?.explanation}</p>}
        </>
      )}
    </div>
  )
}

// ── Incoming challenges section ──────────────────────────────────────────────
function IncomingChallengesSection() {
  const { user }    = useAuthStore()
  const queryClient = useQueryClient()

  const { data: incoming = [] } = useQuery<IncomingChallenge[]>({
    queryKey: ['incoming_challenges', user?.id],
    queryFn:  () => fetchIncomingChallenges(user!.id),
    enabled:  !!user,
    refetchInterval: 10_000,
  })

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: (duelId: string) => acceptDuel(duelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming_challenges', user?.id] }),
  })

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: (duelId: string) => rejectDuel(duelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming_challenges', user?.id] }),
  })

  if (!user || incoming.length === 0) return null

  return (
    <GlassCard className="overflow-hidden border-primary-container/30">
      <div className="px-4 py-2.5 border-b border-primary-container/20 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-primary-container">
          Incoming Challenges
        </p>
        <span className="ml-auto text-[9px] font-lexend font-bold text-primary-container/60 bg-primary-container/10 px-1.5 py-0.5 rounded-full">
          {incoming.length}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {incoming.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/3 rounded-xl border border-white/8">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-[11px] font-lexend font-bold text-primary-container flex-shrink-0">
              {c.challengerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-lexend font-semibold text-xs text-white/70 truncate">
                {c.challengerName}
              </p>
              <p className="text-[9px] font-lexend text-white/25">challenged you to a duel</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => accept(c.id)}
                disabled={accepting}
                className="px-2.5 py-1 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest bg-primary-container/15 text-primary-container border border-primary-container/30 hover:bg-primary-container/25 transition-colors disabled:opacity-40"
              >
                Accept
              </button>
              <button
                onClick={() => reject(c.id)}
                disabled={rejecting}
                className="px-2.5 py-1 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest bg-white/5 text-white/30 border border-white/10 hover:bg-red-400/10 hover:border-red-400/20 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── Fan Duel tab ───────────────────────────────────────────────────────────────
function FanDuelTab() {
  const { user }        = useAuthStore()
  const queryClient     = useQueryClient()

  const { data: opponents = [], isLoading: loadingOpponents } = useQuery({
    queryKey: ['potential_opponents', user?.id],
    queryFn:  () => fetchPotentialOpponents(user!.id),
    enabled:  !!user,
  })

  const { data: duelStats } = useQuery<DuelStats>({
    queryKey: ['duel_stats', user?.id],
    queryFn:  () => fetchUserDuelStats(user!.id),
    enabled:  !!user,
  })

  const { data: recentDuels = [] } = useQuery<RecentDuel[]>({
    queryKey: ['recent_duels', user?.id],
    queryFn:  () => fetchRecentDuels(user!.id),
    enabled:  !!user,
  })

  const { data: activeDuel } = useQuery({
    queryKey: ['active_duel', user?.id],
    queryFn:  () => fetchActiveDuel(user!.id),
    enabled:  !!user,
    refetchInterval: 10_000,
  })

  const { mutate: challenge, variables: challengingId } = useMutation({
    mutationFn: (opponentId: string) => createDuelChallenge(user!.id, opponentId),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['active_duel', user?.id] }),
  })

  if (!user) {
    return (
      <GlassCard className="p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">swords</span>
        <p className="font-lexend font-black text-sm text-white/20">
          Sign in to challenge other fans
        </p>
      </GlassCard>
    )
  }

  const wins    = duelStats?.wins   ?? 0
  const losses  = duelStats?.losses ?? 0
  const total   = duelStats?.total  ?? 0
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 space-y-5">
        {/* Incoming challenges */}
        <IncomingChallengesSection />

        {/* Challenge list */}
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-container">
              sports_mma
            </span>
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
              Challenge a Fan
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-lexend text-white/30 leading-relaxed mb-4">
              Head-to-head trivia duels against other fans. First to 3 correct answers wins.
            </p>
            {loadingOpponents ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : opponents.length === 0 ? (
              <p className="text-center text-[11px] font-lexend text-white/20 py-4">
                No opponents found yet
              </p>
            ) : (
              <div className="space-y-3">
                {opponents.map((opp) => {
                  const pending = (challengingId as string | undefined) === opp.id
                  return (
                    <div
                      key={opp.id}
                      className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-sm font-lexend font-bold text-primary-container flex-shrink-0">
                        {opp.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-lexend font-bold text-sm text-white/70">
                          {opp.username}
                        </p>
                        <span className="text-[10px] font-lexend text-primary-container font-bold">
                          {opp.xp.toLocaleString()} XP
                        </span>
                      </div>
                      <button
                        onClick={() => challenge(opp.id)}
                        disabled={pending}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest transition-colors ${
                          pending
                            ? 'bg-primary-container/15 text-primary-container border border-primary-container/30'
                            : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white/50'
                        }`}
                      >
                        {pending ? 'Challenged!' : 'Duel'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Active duel */}
        {activeDuel && (
          <GlassCard className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-primary-container">
                  Live Duel
                </p>
              </div>
              <span className="text-[10px] font-lexend text-white/20">First to 3 wins</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center gap-8 mb-5">
                <div className="text-center">
                  <p className="font-lexend font-black text-3xl text-primary-container">
                    {activeDuel.challenger_score}
                  </p>
                  <p className="text-[10px] font-lexend text-white/30 mt-1">
                    {activeDuel.challenger_id === user.id
                      ? 'You'
                      : (activeDuel.challenger?.username ?? 'Challenger')}
                  </p>
                </div>
                <span className="font-lexend font-black text-xl text-white/10">vs</span>
                <div className="text-center">
                  <p className="font-lexend font-black text-3xl text-white/40">
                    {activeDuel.opponent_score}
                  </p>
                  <p className="text-[10px] font-lexend text-white/30 mt-1">
                    {activeDuel.opponent_id === user.id
                      ? 'You'
                      : (activeDuel.opponent?.username ?? 'Opponent')}
                  </p>
                </div>
              </div>
              <p className="text-center text-[11px] font-lexend text-white/20">
                Duel questions load from the match detail page
              </p>
            </div>
          </GlassCard>
        )}
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Practice vs Bot</p>
          </div>
          <PracticeDuelBot />
        </GlassCard>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        <GlassCard className="p-4 text-center">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-1">
            Your Duel Record
          </p>
          <div className="flex justify-center gap-6 py-3">
            <div>
              <p className="font-lexend font-black text-2xl text-primary-container">{wins}</p>
              <p className="text-[9px] font-lexend text-white/20 uppercase">Wins</p>
            </div>
            <div>
              <p className="font-lexend font-black text-2xl text-white/30">{losses}</p>
              <p className="text-[9px] font-lexend text-white/20 uppercase">Losses</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
          <p className="text-[9px] font-lexend text-primary-container mt-1.5">{winRate}% win rate</p>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
              Recent Duels
            </p>
          </div>
          {recentDuels.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentDuels.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-xs font-lexend">
                  <span
                    className={`font-black w-4 ${
                      d.result === 'W'
                        ? 'text-primary-container'
                        : d.result === 'L'
                          ? 'text-red-400'
                          : 'text-white/20'
                    }`}
                  >
                    {d.result}
                  </span>
                  <span className="text-white/40 flex-1 truncate">{d.opponentName}</span>
                  <span className="text-white/20">
                    {d.myScore}–{d.theirScore}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-[11px] font-lexend text-white/20">
              No duels yet — challenge someone!
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

// ── Bracket tab placeholder ────────────────────────────────────────────────────


// ── Main page ──────────────────────────────────────────────────────────────────
export function GamesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<GameTab>('trivia')

  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00FF41]" />
        <span className="text-primary-container font-lexend font-semibold uppercase text-sm">
          Live Fan Games Hub
        </span>
      </div>
      <h1 className="font-lexend font-black text-5xl uppercase italic mb-6">
        Fan Games & AI Hub
      </h1>

      <div className="flex gap-1 border-b border-white/8 mb-6 overflow-x-auto scrollbar-none">
        {GAME_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 pb-3 pt-1
              text-[11px] font-lexend font-bold uppercase tracking-widest
              border-b-2 transition-all whitespace-nowrap flex-shrink-0
              ${
                activeTab === tab.id
                  ? 'border-primary-container text-primary-container'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }
            `}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {activeTab === 'trivia'    && <AiTriviaWrapper />}
      {activeTab === 'predictor' && <PredictorTab />}
      {activeTab === 'duel'      && <FanDuelTab />}
      {activeTab === 'bracket'   && <BracketTab />}
    </PageWrapper>
  )
}