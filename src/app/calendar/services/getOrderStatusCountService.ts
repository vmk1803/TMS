import api from '../../../lib/api'

export interface OrderStatusSummary {
  total: number
  on_hold: number
  pending: number
  rejected: number
  cancelled: number
  completed: number
}

export interface OrderStatusByDate {
  date: string
  summary: OrderStatusSummary
}

export interface OrderStatusSummaryResponse {
  success: boolean
  message?: string
  data: OrderStatusByDate[]
}

export async function getOrderStatusCount(
  fromDate: string,
  toDate: string
): Promise<OrderStatusByDate[]> {
  try {
    const payload = {
      fromDate,
      toDate,
    }

    const response = await api.post('/orders/getOrderStatusCount', payload)
    const resData: OrderStatusSummaryResponse = response.data

    if (!resData?.success) {
      throw new Error(resData?.message || 'Failed to fetch order status summary')
    }

    return Array.isArray(resData.data) ? resData.data : []
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch order status summary')
  }
}
