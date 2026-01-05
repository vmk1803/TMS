import api from "../../../lib/api";

export interface PartnerOrderCountItem {
  entity_type: string;
  entity_id: number;
  entity_name: string;
  entity_email: string;
  order_count: number;
  completed_order_count?: number;
}

export interface PartnerOrderCountsResponse {
  success: boolean;
  data: PartnerOrderCountItem[];
}

export async function getPartnerOrderCountsByType(params: {
  type: string;
  start_date: string;
  end_date: string;
}): Promise<PartnerOrderCountItem[]> {
  const { type, start_date, end_date } = params;

  const res = await api.get("/partners/getAllOrderCountsByType", {
    params: { type, start_date, end_date },
  });

  const data = res.data as PartnerOrderCountsResponse;
  if (!data?.success || !Array.isArray(data.data)) return [];
  return data.data;
}
