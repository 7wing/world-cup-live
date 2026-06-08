// src/api/translate.ts
// Free translation via MyMemory — no API key, no cost, 50k chars/day.

/**
 * Translates text into the target language using the MyMemory free API.
 * targetLang should be an ISO 639-1 code: 'en' | 'es' | 'fr' | 'pt' | 'ar'
 * Returns the original text if translation fails rather than throwing.
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  // Skip if empty or very short — not worth the round trip
  const stripped = text.replace(/\p{Emoji}/gu, '').trim()
  if (stripped.length < 3) return text

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`
    )
    if (!res.ok) return text
    const data = await res.json()
    return data.responseData?.translatedText ?? text
  } catch {
    return text
  }
}