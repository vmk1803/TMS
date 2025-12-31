"use client"

import { useEffect, useState } from 'react'
import { getAllTubes } from '../services/testTubesService'
import type { TubeDTO } from '../../../../types/testTubes'

export function useTubes(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [data, setData] = useState<TubeDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(initialPageSize)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getAllTubes(page, pageSize)
        if (!active) return
        setData(Array.isArray(res.data) ? res.data : [])
        setTotal(Number(res.total_count || 0))
        setLimit(Number(res.limit || pageSize))
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch tubes')
        setData([])
        setTotal(0)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [page, pageSize])

  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1

  return { page, setPage, pageSize, setPageSize, data, loading, error, totalPages, limit, total }
}

export function useAllTubes(batchSize = 100) {
  const [data, setData] = useState<TubeDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadAll = async () => {
      try {
        setLoading(true)
        setError(null)
        let page = 1
        let all: TubeDTO[] = []
        let total = Infinity
        // Fetch pages until we have all rows
        while (all.length < total) {
          const res = await getAllTubes(page, batchSize)
          if (!active) return
          const pageData = Array.isArray(res.data) ? res.data : []
          all = all.concat(pageData)
          total = Number(res.total_count || pageData.length)
          if (pageData.length === 0) break
          page += 1
        }
        if (!active) return
        setData(all)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch tubes')
        setData([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAll()
    return () => { active = false }
  }, [batchSize])

  return { data, loading, error }
}
