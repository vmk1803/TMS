"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getGlobalAudits } from '../../audits/services/GlobalAuditsService'
import { searchParamsToPagination } from '../../../utils/filterPersistence'

export function useGlobalAudits(initialPage = 1, initialPageSize = 10) {
    const searchParams = useSearchParams()
    
    // Initialize pagination state from URL parameters
    const paginationFromUrl = searchParamsToPagination(searchParams)
    const [page, setPage] = useState(paginationFromUrl.page)
    const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize)
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [limit, setLimit] = useState(paginationFromUrl.pageSize)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await getGlobalAudits(page, pageSize, filters)
                if (!active) return
                const items = Array.isArray(res) ? res : (res?.data ?? [])
                setData(items)
                const totalCount = res?.total_count ?? 0
                const resLimit = res?.limit ?? pageSize
                setTotal(Number(totalCount || 0))
                setLimit(Number(resLimit || pageSize))
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
    }, [page, pageSize, filters, reloadKey])

    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1
    const reload = () => setReloadKey((k) => k + 1)
    return { page, setPage, pageSize, setPageSize, data, loading, error, totalPages, limit, total, filters, setFilters, reload }
}

export type UseGlobalAuditsReturn = ReturnType<typeof useGlobalAudits>