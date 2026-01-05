"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllTests } from "../services/labTestsService";

interface UseTestsProps {
  page: number;
  pageSize: number;
  filters: Record<string, string>;
  sortBy?: string;
  sortOrder?: string;
}

export function useLabTests({
  page,
  pageSize,
  filters,
  sortBy = "created_at",
  sortOrder = "DESC",
}: UseTestsProps) {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    let active = true;
    try {
      setLoading(true);
      setError(null);
      const res = await getAllTests({
        page,
        pageSize,
        filters,
        sortBy,
        sortorder: sortOrder,
      });
      if (!active) return;
      setData(res.data || []);
      setTotalCount(res.total_count || 0);
    } catch (e: any) {
      if (!active) return;
      setError(e.message);
      setData([]);
    } finally {
      if (active) setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [page, pageSize, sortBy, sortOrder, JSON.stringify(filters)]);

  // Debounced auto fetch on dependency changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  // Manual immediate refetch (no debounce)
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalCount, loading, error, refetch };
}
