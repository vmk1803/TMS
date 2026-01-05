import { useCallback, useEffect, useState } from 'react'
import { getPhysicians, GetPhysiciansResult } from '../services/physiciansService'
import { PhysicianDTO } from '../../../../types/physicians'

interface UseFilteredPhysiciansProps {
  page: number
  pageSize: number
  filters: Record<string, string>
}

export function useFilteredPhysicians({ page, pageSize, filters }: UseFilteredPhysiciansProps) {
  const [data, setData] = useState<PhysicianDTO[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const fetchData = useCallback(async () => {
    let active = true
    try {
      setLoading(true)
      setError(null)
      const res: GetPhysiciansResult = await getPhysicians({ page, pageSize, filters })
      if (!active) return
      setData(res.data || [])
      setTotalRecords(res.total_records || res.total_count || 0)
      setTotalPages(res.total_pages || Math.max(1, Math.ceil((res.total_records || res.total_count || 0) / pageSize)))
      setMessage(res.message)
    } catch (e: any) {
      if (!active) return
      setError(e?.message || 'Failed to load physicians')
      setData([])
    } finally {
      if (active) setLoading(false)
    }
    return () => { active = false }
  }, [page, pageSize, JSON.stringify(filters)])

  useEffect(() => {
    const id = setTimeout(() => fetchData(), 300) 
    return () => clearTimeout(id)
  }, [fetchData])

  const refetch = useCallback(() => { fetchData() }, [fetchData])

  return { data, totalRecords, totalPages, loading, error, message, refetch }
}