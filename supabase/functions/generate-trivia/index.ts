import { serve }        from 'std/http/server'
import { createClient } from '@supabase/supabase-js'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

serve(async (req) => {
  try {
    const { topic = 'FIFA World Cup 2026', count = 10, match_id = null } =
      await req.json().catch(() => ({}))

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) return new Response('GEMINI_API_KEY not set', { status: 500 })

    const prompt = `Generate ${count} diverse multiple-choice trivia questions about ${topic}.
IMPORTANT: Make questions varied — mix easy, medium, hard difficulty.
Respond ONLY with a valid JSON array, no markdown fences:
[{"question":"...","options":["A","B","C","D"],"answer":0,"points":30,"difficulty":"medium","tag":"History"}]
- answer is 0-based index of correct option
- points: easy=20, medium=30, hard=50
- difficulty: "easy"|"medium"|"hard"
- tag: short category label`

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 2048 },
      }),
    })

    if (!geminiRes.ok) throw new Error(`Gemini ${geminiRes.status}`)

    const geminiData = await geminiRes.json()
    const text: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in Gemini response')

    const questions: {
      question:   string
      options:    string[]
      answer:     number
      points:     number
      difficulty: string
      tag:        string
    }[] = JSON.parse(match[0])

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: existing } = await supabase
      .from('trivia_questions')
      .select('question')
      .in('question', questions.map((q) => q.question))

    const existingSet = new Set((existing ?? []).map((r: { question: string }) => r.question))
    const toInsert = questions
      .filter((q) => !existingSet.has(q.question))
      .map((q) => ({
        question:   q.question,
        options:    q.options,
        answer:     q.answer,
        points:     q.points,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        tag:        q.tag,
        source:     'gemini' as const,
        match_id:   match_id,
      }))

    if (toInsert.length > 0) {
      const { error } = await supabase.from('trivia_questions').insert(toInsert)
      if (error) throw error
    }

    return new Response(
      JSON.stringify({ inserted: toInsert.length, skipped: questions.length - toInsert.length }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[generate-trivia]', err)
    return new Response(String(err), { status: 500 })
  }
})