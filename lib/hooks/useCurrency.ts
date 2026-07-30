// lib/hooks/useCurrency.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrencySymbol } from '@/lib/utils/currency'

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState('EUR')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('default_currency')
          .single()

        if (!error && data?.default_currency) {
          setCurrencyCode(data.default_currency)
        }
      } catch (err) {
        console.error('Error fetching currency settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrency()
  }, [])

  const symbol = getCurrencySymbol(currencyCode)

  const formatPrice = (amount: number) => `${symbol}${amount.toFixed(2)}`

  return { currencyCode, symbol, formatPrice, loading }
}