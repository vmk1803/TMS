"use client";

import { useEffect, useState } from "react";
import { fetchTechnicians } from "../services/technicianService";
import type { Technician } from "../../../../types/technician";

export function useTechnicians(page: number = 1, pageSize: number = 10) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let res = await fetchTechnicians();
        res.data = res.data.filter((t)=> t.is_deleted == false);
        if (!cancelled) {
          setTechnicians(res.data || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load technicians");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const options = technicians
    .filter((t) => t.user_type === "TECHNICIAN")
    .map((t) => ({
      id: t.id,
      guid: t.guid,
      label: `${t.first_name} ${t.last_name}`.trim(),
    }));

  return { technicians, options, loading, error };
}
