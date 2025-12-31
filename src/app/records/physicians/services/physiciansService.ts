import api from '../../../../lib/api'
import { PhysicianDTO, PhysicianCreatePayload } from '../../../../types/physicians'

export interface GetPhysiciansParams {
  page?: number
  pageSize?: number
  filters?: Record<string, string>
}

export interface GetPhysiciansResult {
  data: PhysicianDTO[]
  page: number
  limit: number
  total_count: number
  total_pages?: number
  total_records?: number
  message?: string
}

export async function getPhysicians({ page = 1, pageSize = 10, filters }: GetPhysiciansParams = {}): Promise<GetPhysiciansResult> {
  try {
    const payload: any = { page, pageSize }
    if (filters && Object.keys(filters).length) payload.filters = filters
    const res = await api.post('/physicians/getAllPhysicians', payload)
    const body = res?.data || {}
    const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body?.data?.data) ? body.data.data : []
    return {
      data: rows as PhysicianDTO[],
      page: Number(body?.page ?? page),
      limit: Number(body?.limit ?? body?.pageSize ?? pageSize),
      total_count: Number(body?.total_count ?? body?.total ?? body?.totalRecords ?? rows.length),
      total_pages: Number((body?.total_pages ?? body?.totalPages) ?? Math.ceil(rows.length / pageSize)),
      total_records: Number(body?.total_records ?? body?.totalRecords ?? body?.total_count ?? rows.length),
      message: body?.message,
    }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch physicians')
  }
}

export async function savePhysician(payload: PhysicianCreatePayload): Promise<any> {
  try {
    const res = await api.post('/physicians/savePhysician', payload)
    return res?.data
  } catch (error: any) {
    const errorData = error?.response?.data
    if (errorData?.error_data) {
      // Create custom error with error_data for individual field errors
      const customError = new Error(errorData?.message || 'Failed to save physician')
      ;(customError as any).error_data = errorData.error_data
      throw customError
    }
    throw new Error(errorData?.message || 'Failed to save physician')
  }
}

export async function getPhysicianByGuid(guid: string): Promise<any> {
  try {
    const res = await api.get(`/physicians/getPhysicianByGuid/${guid}`)
    return res?.data?.data ?? res?.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch physician details')
  }
}

export async function updatePhysician(guid: string, payload: Partial<PhysicianCreatePayload>): Promise<any> {
  try {
    const res = await api.put(`/physicians/updatePhysician/${guid}`, payload)
    return res?.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update physician')
  }
}

export async function deletePhysician(guid: string): Promise<any> {
  try {
    const res = await api.delete(`/physicians/deletePhysician/${guid}`)
    return res?.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to delete physician')
  }
}
export async function getPhysicianByNpi(npi: string): Promise<any> {
  try {
    const res = await api.get(`/physicians/getPhysicianByNpi/${npi}`);
    return res?.data?.data ?? res?.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch physician by NPI"
    );
  }
}
