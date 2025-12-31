"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllOrders } from '../services/getAllOrderService'
import { DASHBOARD_EXPORT_COLUMNS } from '../../../../types/order'
import { searchParamsToFilters, searchParamsToPagination } from '../../../../utils/filterPersistence'

export function useOrders(initialPage = 1, initialPageSize = 10) {
    const searchParams = useSearchParams()

    // Initialize pagination state from URL parameters
    const paginationFromUrl = searchParamsToPagination(searchParams)

    // Initialize filters from URL search parameters
    const filterKeys = [
        'phlebio_order_id', 'patient_name', 'date_of_birth', 'lis_order', 'order_type',
        'urgency', 'fasting', 'tat', 'test_name', 'partner_name',
        'physician_name', 'created_at', 'date_of_service', 'service_address',
        'patient_address', 'technician', 'lastServicedBy', 'adminNotes',
        'technicianNotes', 'statuses'
    ]

    const [page, setPage] = useState(paginationFromUrl.page)
    const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize)
    const [filters, setFilters] = useState<Record<string, any>>(() => {
        // Initialize from URL on first mount
        const urlFilters: Record<string, any> = searchParamsToFilters(searchParams, filterKeys)

        // Convert statuses from comma-separated string to array if present
        if (urlFilters.statuses && typeof urlFilters.statuses === 'string') {
            const statusArray = urlFilters.statuses.split(',').filter(Boolean)
            if (statusArray.length > 0) {
                urlFilters.statuses = statusArray
            } else {
                delete urlFilters.statuses
            }
        }

        return urlFilters
    })
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [limit, setLimit] = useState(initialPageSize)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await getAllOrders(page, pageSize, filters)
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


export function downloadOrdersCsv(orders: any[], filename = 'orders.csv') {
    if (!orders || orders.length === 0) return

    const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return ''
        let s = String(value)
        s = s.replace(/\r\n|\r/g, '\n')
        return s.includes('"') || s.includes(',') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }

    const headers = DASHBOARD_EXPORT_COLUMNS.map(c => c.header)
    const rows = [headers.join(',')]

    for (const order of orders) {
        const row = DASHBOARD_EXPORT_COLUMNS.map(c => escapeCsv(c.extract?.(order) ?? ''))
        rows.push(row.join(','))
    }

    const csvString = rows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
