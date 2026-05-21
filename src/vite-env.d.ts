/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_DATA?: string
  readonly VITE_USE_MOCK_PROFILE?: string
  readonly VITE_GOOGLE_GEMINI_API_KEY?: string
  readonly VITE_GEMINI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}