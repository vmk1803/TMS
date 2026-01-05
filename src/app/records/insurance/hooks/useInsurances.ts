import { useEffect, useState } from 'react'
import { getInsurances, GetInsurancesResponse } from '../services/insuranceService'
import { InsuranceDTO } from '../../../../types/Insurances'

export function useInsurances(page = 1, pageSize = 10, filters?: Record<string, any>) {
  const [data, setData] = useState<InsuranceDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)
  const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res: GetInsurancesResponse = await getInsurances({ page, pageSize, filters })
        if (!active) return
        setData(res.data || [])
        setTotalPages(res.totalPages)
        setTotalRecords(res.totalRecords)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch insurances')
        setData([])
        setTotalPages(undefined)
        setTotalRecords(undefined)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [page, pageSize, JSON.stringify(filters)])

  return { data, loading, error, totalPages, totalRecords }
}

export function useAllInsurances(batchSize = 100, filters?: Record<string, any>) {
  const [data, setData] = useState<InsuranceDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadAll = async () => {
      try {
        setLoading(true)
        setError(null)
        let page = 1
        let all: InsuranceDTO[] = []
        while (true) {
          const pageDataRes = await getInsurances({ page, pageSize: batchSize, filters })
          if (!active) return
          const arr = Array.isArray(pageDataRes.data) ? pageDataRes.data : []
          if (arr.length === 0) break
          all = all.concat(arr)
          if (arr.length < batchSize) break
          page += 1
        }
        if (!active) return
        setData(all)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch insurances')
        setData([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAll()
    return () => { active = false }
  }, [batchSize, JSON.stringify(filters)])

  return { data, loading, error }
}
