"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOrdersSummary,
  OrdersSummaryItem,
} from "../app/dashboard/services/ordersSummaryService";

export type OrdersSummaryRangeOption =
  | "Today"
  | "Yesterday"
  | "Last Week"
  | "Last Month"
  | "Last Year"
  | "Custom";

export interface OrdersSummaryRange {
  created_from: string;
  created_to: string;
}

export interface CustomDateRange {
  fromDate: Date | null;
  toDate: Date | null;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}-${month}-${day}`;
}

function getLastWeekRange(today: Date): OrdersSummaryRange {
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  return {
    created_from: formatDate(lastWeekStart),
    created_to: formatDate(lastWeekEnd),
  };
}

function getLastMonthRange(today: Date): OrdersSummaryRange {
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    created_from: formatDate(start),
    created_to: formatDate(end),
  };
}

function getLastYearRange(today: Date): OrdersSummaryRange {
  const year = today.getFullYear() - 1;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  return {
    created_from: formatDate(start),
    created_to: formatDate(end),
  };
}

function getRangeForOption(
  option: OrdersSummaryRangeOption,
  customDateRange: CustomDateRange,
  today: Date
): OrdersSummaryRange {
  if (option === "Yesterday") {
    const d = new Date(today);
    d.setDate(today.getDate() - 1);
    const formatted = formatDate(d);
    return { created_from: formatted, created_to: formatted };
  }

  if (option === "Last Week") {
    return getLastWeekRange(today);
  }

  if (option === "Last Month") {
    return getLastMonthRange(today);
  }

  if (option === "Last Year") {
    return getLastYearRange(today);
  }

  if (option === "Custom" && customDateRange.fromDate && customDateRange.toDate) {
    return {
      created_from: formatDate(customDateRange.fromDate),
      created_to: formatDate(customDateRange.toDate),
    };
  }

  const formattedToday = formatDate(today);
  return { created_from: formattedToday, created_to: formattedToday };
}

export interface OrdersSummaryByStatusItem extends OrdersSummaryItem {
  percentage: number;
}

export function useOrdersSummaryDate(
  initialOption: OrdersSummaryRangeOption = "Today"
) {
  const [selectedOption, setSelectedOption] = useState<OrdersSummaryRangeOption>(
    initialOption
  );
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    fromDate: null,
    toDate: null,
  });
  const [data, setData] = useState<OrdersSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  const range = useMemo(
    () => getRangeForOption(selectedOption, customDateRange, today),
    [selectedOption, customDateRange, today]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getOrdersSummary(range.created_from, range.created_to);
        if (!active) return;
        setData(res || []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to fetch orders summary");
        setData([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [range.created_from, range.created_to]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
    [data]
  );

  const byStatus: OrdersSummaryByStatusItem[] = useMemo(() => {
    if (!total) {
      return data.map((item) => ({ ...item, percentage: 0 }));
    }

    return data.map((item) => ({
      ...item,
      percentage: (Number(item.count) || 0) > 0 ? ((Number(item.count) || 0) / total) * 100 : 0,
    }));
  }, [data, total]);

  return {
    data,
    total,
    byStatus,
    loading,
    error,
    selectedOption,
    setSelectedOption,
    customDateRange,
    setCustomDateRange,
    range,
  };
}
