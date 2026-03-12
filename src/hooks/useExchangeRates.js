import { useState, useEffect, useCallback } from 'react'

// Fallback rates (approximate) used when API is unavailable
const FALLBACK_RATES = { UAH: 41.5, EUR: 0.92 }

export function useExchangeRates() {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!res.ok) throw new Error('Exchange rate fetch failed')
        const data = await res.json()
        if (!cancelled) {
          setRates({ UAH: data.rates.UAH, EUR: data.rates.EUR })
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Using fallback exchange rates:', err.message)
          setRates(FALLBACK_RATES)
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchRates()
    return () => { cancelled = true }
  }, [])

  const convertToUAH = useCallback((amount, currency) => {
    const r = rates ?? FALLBACK_RATES
    if (currency === 'UAH') return amount
    if (currency === 'USD') return amount * r.UAH
    if (currency === 'EUR') return amount * (r.UAH / r.EUR)
    return amount
  }, [rates])

  return { rates, loading, error, convertToUAH }
}
