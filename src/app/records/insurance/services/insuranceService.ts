import api from '../../../../lib/api'
import { InsuranceDTO, CreateInsuranceRequest, CreateInsuranceResponse, UpdateInsuranceRequest, GetInsuranceByIdResponse } from '../../../../types/Insurances'

interface GetInsurancesParams {
  page: number
  pageSize: number
  filters?: Record<string, any>
}

export interface GetInsurancesResponse {
  data: InsuranceDTO[]
  page?: number
  pageSize?: number
  totalPages?: number
  totalRecords?: number
  success?: boolean
  status?: number
}

export async function getInsurances({ page, pageSize, filters }: GetInsurancesParams): Promise<GetInsurancesResponse> {
  try {
    const payload: any = { page, pageSize }
    if (filters && Object.keys(filters).length) payload.filters = filters
    const res = await api.post('/insurances/getAllInsurances', payload)
    const root = res?.data || {}
    const arr = root?.data
    const data: InsuranceDTO[] = Array.isArray(arr) ? (arr as InsuranceDTO[]) : []
    return {
      data,
      page: root?.page,
      pageSize: root?.pageSize,
      totalPages: root?.totalPages,
      totalRecords: root?.totalRecords,
      success: root?.success,
      status: root?.status,
    }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch insurances')
  }
}

export async function createInsurance(payload: CreateInsuranceRequest): Promise<CreateInsuranceResponse> {
  try {
    const res = await api.post('/insurances/saveInsurance', payload)
    return res?.data as CreateInsuranceResponse
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create insurance')
  }
}

export async function getInsuranceById(guid: string): Promise<GetInsuranceByIdResponse> {
  try {
    const res = await api.get(`/insurances/getInsuranceById/${guid}`)
    return res?.data as GetInsuranceByIdResponse
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to get insurance')
  }
}

export async function updateInsurance(guid: string, payload: UpdateInsuranceRequest): Promise<CreateInsuranceResponse> {
  try {
    const res = await api.post(`/insurances/updateInsurance/${guid}`, payload)
    return res?.data as CreateInsuranceResponse
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update insurance')
  }
}

export async function deleteInsuranceById(guid: string): Promise<any>{
  try {
    const res = await api.delete(`/insurances/deleteInsuranceById/${guid}`)
    return res?.data as { message?: string }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to delete insurance')
  }
}
