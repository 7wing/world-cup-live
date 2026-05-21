import type { Match } from '@/types'
import type { OracleData } from '@/lib/mockAdapters'

function geminiKey(): string | undefined {
  return (
    import.meta.env.VITE_GOOGLE_GEMINI_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    undefined
  )
}

export function isGeminiEnabled(): boolean {
  return Boolean(geminiKey())
}

export async function fetchGeminiOracle(match: Match): Promise<OracleData | null> {
  const key = geminiKey()
  if (!key) return null

  const prompt = `You are a football analyst. For the match ${match.home_team.name} vs ${match.away_team.name} (${match.stage}), respond with ONLY valid JSON, no markdown:
{"homeWin":number,"draw":number,"awayWin":number,"predictedHome":number,"predictedAway":number,"confidence":number}
Percentages homeWin+draw+awayWin must sum to 100. predictedHome and predictedAway are integers 0-5. confidence is 0-100.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
        }),
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0]) as OracleData
    if (
      typeof parsed.homeWin !== 'number' ||
      typeof parsed.predictedHome !== 'number'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export async function fetchGeminiTrivia(match?: Match): Promise<{
  question: string
  options: string[]
  answer: number
  points: number
} | null> {
  const key = geminiKey()
  if (!key) return null

  const context = match
    ? `about ${match.home_team.name} vs ${match.away_team.name}`
    : 'about FIFA World Cup history'

  const prompt = `Create one multiple-choice trivia question ${context}. Respond with ONLY JSON:
{"question":"...","options":["A","B","C","D"],"answer":0,"points":30}
answer is 0-based index of correct option.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 400 },
        }),
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}
