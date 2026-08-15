// components/shared/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyTheme } from '@/lib/themes/applyTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const loadTheme = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('store_settings')
        .select('theme_id, custom_theme_colors')
        .single()

      if (error || !data) {
        applyTheme('emerald-storm') // safe fallback, matches current site exactly
        return
      }

      applyTheme(data.theme_id || 'emerald-storm', data.custom_theme_colors)
    }

    loadTheme()
  }, [])

  return <>{children}</>
}