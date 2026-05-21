import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { fetchStadiums } from '@/api/stadiums'
import '@/styles/globals.css'

const FONTS_TIMEOUT_MS = 2500

async function bootstrap() {
  const fontsReady = document.fonts.ready
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, FONTS_TIMEOUT_MS))
  await Promise.race([fontsReady, timeout])
  document.documentElement.classList.add('fonts-ready')

  queryClient.prefetchQuery({
    queryKey: ['stadiums'],
    queryFn: fetchStadiums,
  }).catch(() => {})

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

bootstrap()
