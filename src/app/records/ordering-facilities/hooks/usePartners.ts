import { useEffect, useState } from 'react'
import { getPartners } from '../services/partnersService'
import type { Partner } from '../types/partner'

export function usePartners(page: number, pageSize: number, filters?: Record<string, string>) {
  const [data, setData] = useState<Partner[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getPartners({ page, pageSize, filters })
        if (!cancelled) {
          setData(res.data || [])
          // Prefer totalRecords from API, fallback to total, or 0
          setTotal(res.totalRecords ?? res.total ?? 0)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load partners')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, pageSize, JSON.stringify(filters)])

  return { data, total, loading, error }
}

export function useAllPartners(batchSize = 100, filters?: Record<string, string>) {
  const [data, setData] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      setError(null)
      try {
        let page = 1
        let all: Partner[] = []
        let total = Infinity
        while (all.length < total) {
          const res = await getPartners({ page, pageSize: batchSize, filters })
          if (cancelled) return
          const arr = Array.isArray(res.data) ? res.data : []
          all = all.concat(arr)
          // Prefer totalRecords if available to know the true total count
          total = Number(res.totalRecords ?? res.total ?? arr.length)
          if (arr.length < batchSize) break
          page += 1
        }
        if (!cancelled) setData(all)
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load partners')
          setData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [batchSize, JSON.stringify(filters)])

  return { data, loading, error }
}
