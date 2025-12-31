import api from '../../../../lib/api'
import type { GetAllLabTestsResponse, LabTest, CreateLabTestRequest, CreateLabTestResponse, GetTestByGuidResponse, UpdateLabTestRequest, UpdateLabTestResponse, DeleteLabTestResponse } from '../../../../types/labTests'

export interface GetTestsParams {
  page?: number
  pageSize?: number
  filters?: Record<string, string>
  sortBy?: string
  sortorder?: string 
}


export interface GetTestsResult {
  data: LabTest[]
  page: number
  limit: number
  total_count: number
}

export async function getAllTests(params: GetTestsParams = {}): Promise<GetTestsResult> {
  const { page = 1, pageSize = 10, filters, sortBy, sortorder } = params

  const payload: any = { page, pageSize }
  if (filters && Object.keys(filters).length) payload.filters = filters
  if (sortBy) payload.sortBy = sortBy
  if (sortorder) payload.sortorder = sortorder

  const response = await api.post<GetAllLabTestsResponse>('/tests/getAllTests', payload)

  const res = response.data
  return {
    data: Array.isArray(res?.data) ? res.data : [],
    page: Number(res?.page ?? page),
    limit: Number(res?.limit ?? pageSize),
    total_count: Number(res?.total_count ?? 0),
  }
}

export async function createTest(payload: CreateLabTestRequest): Promise<CreateLabTestResponse> {
  const response = await api.post<CreateLabTestResponse>('/tests/saveTest', payload)
  return response.data
}

export async function getTestByGuid(guid: string): Promise<GetTestByGuidResponse> {
  const response = await api.get<GetTestByGuidResponse>(`/tests/getTestByGuid/${guid}`)
  return response.data
}

export async function updateTestByGuid(guid: string, payload: UpdateLabTestRequest): Promise<UpdateLabTestResponse> {
  const response = await api.patch<UpdateLabTestResponse>(`/tests/updateTestByGuid/${guid}`, payload)
  return response.data
}

export async function deleteTestByGuid(guid: string): Promise<DeleteLabTestResponse> {
  // As per requirement: guid passed as query params type
  const response = await api.delete<DeleteLabTestResponse>(`/tests/deleteTestByGuid/${guid}`, { params: { guid } })
  return response.data
}
