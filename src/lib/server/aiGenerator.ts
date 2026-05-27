// src/lib/server/aiGenerator.ts
// Server-side Gemini wrapper for Edge Functions.
// Never import this on the client — it exposes the API key.

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const MAX_CALLS_PER_MINUTE = 10
let callCount = 0
let windowStart = Date.now()

function checkRateLimit() {
  const now = Date.now()
  if (now - windowStart > 60_000) {
    callCount = 0
    windowStart = now
  }
  if (callCount >= MAX_CALLS_PER_MINUTE) {
    throw new Error('Gemini rate limit reached — try again in a minute')
  }
  callCount++
}

export async function generateTriviaBatch(
  apiKey: string,
  topic: string,
  count = 5
): Promise<{ question: string; options: string[]; answer: number; points: number }[]> {
  checkRateLimit()

  const prompt = `Generate ${count} multiple-choice trivia questions about ${topic}.
Respond ONLY with a JSON array, no markdown:
[{"question":"...","options":["A","B","C","D"],"answer":0,"points":30}]
answer is 0-based index. points between 20 and 50.`

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array in Gemini response')

  return JSON.parse(match[0])
}