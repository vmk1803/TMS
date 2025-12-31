"use client"

import { useCallback, useEffect, useState } from 'react'
import { getFilteredTubes } from '../services/testTubesService'
import type { TubeDTO } from '../../../../types/testTubes'

interface UseFilteredTubesProps {
  page: number
  pageSize: number
  filters: Record<string, string>
}

export function useFilteredTubes({ page, pageSize, filters }: UseFilteredTubesProps) {
  const [data, setData] = useState<TubeDTO[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    let active = true
    try {
      setLoading(true)
      setError(null)
      const res = await getFilteredTubes({ page, pageSize, filters })
      if (!active) return
      setData(Array.isArray(res.data) ? res.data : [])
      setTotalCount(Number(res.total_count || 0))
    } catch (e: any) {
      if (!active) return
      setError(e?.message || 'Failed to load test tubes')
      setData([])
    } finally {
      if (active) setLoading(false)
    }
    return () => { active = false }
  }, [page, pageSize, JSON.stringify(filters)])

  useEffect(() => {
    const timeoutId = setTimeout(() => { fetchData() }, 300)
    return () => clearTimeout(timeoutId)
  }, [fetchData])

  const refetch = useCallback(() => { fetchData() }, [fetchData])

  return { data, totalCount, loading, error, refetch }
}
