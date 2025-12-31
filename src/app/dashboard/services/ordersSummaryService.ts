import api from "../../../lib/api";

export interface OrdersSummaryItem {
  status: string;
  count: number;
}

export interface OrdersSummaryApiResponse {
  status: number;
  message?: string;
  data: OrdersSummaryItem[];
}

export async function getOrdersSummary(
  createdFrom: string,
  createdTo: string
): Promise<OrdersSummaryItem[]> {
  try {
    const payload = {
      filters: {
        created_from: createdFrom,
        created_to: createdTo,
      },
    };

    const response = await api.post("/orders/getOdersSummary", payload);
    const resData: OrdersSummaryApiResponse = response.data;

    if (!Array.isArray(resData?.data)) {
      return [];
    }

    return resData.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch orders summary");
  }
}
