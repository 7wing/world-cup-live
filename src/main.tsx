import '@/i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { fetchMatches } from '@/api/matches'
import { fetchStadiumsWithHero } from '@/hooks/useStadium'
import { registerServiceWorker } from '@/lib/pushNotifications'
import '@/styles/globals.css'

// Register service worker for push notifications (best-effort, non-blocking)
registerServiceWorker().catch(() => {})

// Prefetch critical data immediately without blocking render
queryClient.prefetchQuery({
  queryKey: ['stadiums'],
  queryFn: fetchStadiumsWithHero,
}).catch(() => {})

queryClient.prefetchQuery({
  queryKey: ['matches'],
  queryFn: fetchMatches,
}).catch(() => {})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
