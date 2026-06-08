// src/hooks/useTranslate.ts
// Manages translated vs original state for a single piece of text.
// Works identically for posts, reviews, and chat messages.

import { useState } from 'react'

export function useTranslate(original: string) {
  const [translated, setTranslated] = useState<string | null>(null)

  return {
    displayText: translated ?? original,
    isTranslated: translated !== null,
    onTranslated: setTranslated,
    onReset: () => setTranslated(null),
  }
}