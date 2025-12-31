import { useState, useCallback } from 'react'
import { savePartner } from '../services/partnersService'

export function useCreatePartner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async (payload: any) => {
    try {
      setLoading(true)
      setError(null)
      const res = await savePartner(payload)
      return res
    } catch (e: any) {
      setError(e?.message || 'Failed to create partner')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { save, loading, error }
}
