// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { ThemeProvider } from '@/components/shared/ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
    </ThemeProvider>
  )
}