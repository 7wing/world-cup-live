import { QueryClient } from '@tanstack/react-query'

const MINUTE = 60_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE,          // 1 min default — most data doesn't change faster
      gcTime: 5 * MINUTE,         // keep unused data in cache for 5 min
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})