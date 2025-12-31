import api from '../../../../lib/api'
import { PartnersResponse } from '../../../records/ordering-facilities/types/partner'

export async function getAllOrders(page: number, pageSize: number, filters?: Record<string, any>): Promise<any> {
  try {
    const payload: Record<string, any> = { page, pageSize }
    if (filters && Object.keys(filters).length) payload.filters = filters
    const response = await api.post('/orders/getAllOrders', payload)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders')
  }
}

export async function getAllPartners(params: { page: number; pageSize: number }): Promise<PartnersResponse> {
  const { page, pageSize } = params;

  const res = await api.post('/partners/getAllPartners', {
    page,
    pageSize
  });

  return res.data as PartnersResponse;
}
