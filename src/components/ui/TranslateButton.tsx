// src/components/ui/TranslateButton.tsx
// Drop this onto any post, review, or chat message that needs translation.

import { useState } from 'react'
import { translateText } from '@/api/translate'
import { useTranslation } from 'react-i18next'

interface TranslateButtonProps {
  text: string
  onTranslated: (translated: string) => void
  onReset: () => void
  isTranslated: boolean
}

export function TranslateButton({
  text,
  onTranslated,
  onReset,
  isTranslated,
}: TranslateButtonProps) {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)

  async function handleTranslate() {
    setLoading(true)
    const result = await translateText(text, i18n.language)
    onTranslated(result)
    setLoading(false)
  }

  if (isTranslated) {
    return (
      <button
        type="button"
        onClick={onReset}
        className="text-[9px] font-lexend text-white/20 hover:text-white/50 transition-colors"
      >
        Show original
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading}
      className="text-[9px] font-lexend text-white/20 hover:text-primary-container transition-colors disabled:opacity-40"
    >
      {loading ? 'Translating…' : 'Translate'}
    </button>
  )
}