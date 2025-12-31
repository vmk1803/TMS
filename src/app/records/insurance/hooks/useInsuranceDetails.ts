import { useEffect, useState } from 'react'
import { getInsuranceById } from '../services/insuranceService'
import { InsuranceDTO } from '../../../../types/Insurances'

export function useInsuranceDetails(guid?: string) {
  const [data, setData] = useState<InsuranceDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!guid) return
      try {
        setLoading(true)
        setError(null)
        const res = await getInsuranceById(guid)
        if (!active) return
        setData(res?.data ?? null)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch insurance details')
        setData(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [guid])

  return { data, loading, error }
}
