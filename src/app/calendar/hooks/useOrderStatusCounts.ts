"use client"

import { useEffect, useMemo, useState } from 'react'
import { getOrderStatusCount, OrderStatusByDate, OrderStatusSummary } from '../services/getOrderStatusCountService'

export type CalendarView = 'day' | 'week' | 'month'

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeForView(view: CalendarView, currentDate: Date): { from: string; to: string } {
  if (view === 'day') {
    const d = new Date(currentDate)
    const formatted = formatDate(d)
    return { from: formatted, to: formatted }
  }

  if (view === 'week') {
    const start = new Date(currentDate)
    start.setDate(currentDate.getDate() - currentDate.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { from: formatDate(start), to: formatDate(end) }
  }

  const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  return { from: formatDate(startMonth), to: formatDate(endMonth) }
}

export function useOrderStatusCounts(view: CalendarView, currentDate: Date) {
  const [data, setData] = useState<OrderStatusByDate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => getRangeForView(view, currentDate), [view, currentDate.toDateString()])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getOrderStatusCount(range.from, range.to)
        if (!active) return
        setData(res)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to fetch order status summary')
        setData([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [range.from, range.to])

  // Aggregate all summaries from all dates
  const aggregatedSummary = useMemo(() => {
    const summary: OrderStatusSummary = {
      total: 0,
      on_hold: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    }

    data.forEach((item) => {
      summary.total += item.summary.total || 0
      summary.on_hold += item.summary.on_hold || 0
      summary.pending += item.summary.pending || 0
      summary.rejected += item.summary.rejected || 0
      summary.cancelled += item.summary.cancelled || 0
      summary.completed += item.summary.completed || 0
    })

    return summary
  }, [data])

  return { data, aggregatedSummary, loading, error, range }
}
