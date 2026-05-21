import type { Prediction } from '@/types'

const KEY = 'wcl-predictions'

interface StoredPrediction {
  match_id: string
  predicted_home: number
  predicted_away: number
  created_at: string
}

function readAll(userId: string): StoredPrediction[] {
  try {
    const raw = localStorage.getItem(KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, StoredPrediction[]>) : {}
    return all[userId] ?? []
  } catch {
    return []
  }
}

function writeAll(userId: string, list: StoredPrediction[]) {
  const raw = localStorage.getItem(KEY)
  const all = raw ? (JSON.parse(raw) as Record<string, StoredPrediction[]>) : {}
  all[userId] = list
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function savePrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): void {
  const list = readAll(userId).filter((p) => p.match_id !== matchId)
  list.push({
    match_id: matchId,
    predicted_home: predictedHome,
    predicted_away: predictedAway,
    created_at: new Date().toISOString(),
  })
  writeAll(userId, list)
}

export function getPrediction(
  userId: string,
  matchId: string,
): StoredPrediction | undefined {
  return readAll(userId).find((p) => p.match_id === matchId)
}

export function scorePrediction(
  predictedHome: number,
  predictedAway: number,
  oracleHome: number,
  oracleAway: number,
): number {
  if (predictedHome === oracleHome && predictedAway === oracleAway) return 50
  const predResult =
    predictedHome > predictedAway ? 'home' : predictedHome < predictedAway ? 'away' : 'draw'
  const oracleResult =
    oracleHome > oracleAway ? 'home' : oracleHome < oracleAway ? 'away' : 'draw'
  return predResult === oracleResult ? 10 : 0
}

export function toPredictionRecords(userId: string): Prediction[] {
  return readAll(userId).map((p, i) => ({
    id: `local-${i}`,
    user_id: userId,
    match_id: p.match_id,
    predicted_home: p.predicted_home,
    predicted_away: p.predicted_away,
    points_earned: 0,
    is_correct: null,
    created_at: p.created_at,
  }))
}
