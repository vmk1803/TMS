import api from '../../../../lib/api'
import type { SaveTestTubeResponse, GetAllTubesResponse, GetAllTubesResult, GetTubeByGuidResponse } from '../../../../types/testTubes'

export async function saveTestTube(formData: FormData): Promise<SaveTestTubeResponse> {
  const res = await api.post<SaveTestTubeResponse>('/tests-tube/saveTestTube', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getAllTubes(page = 1, pageSize?): Promise<GetAllTubesResult> {
  const response = await api.post<GetAllTubesResponse>('/tests-tube/getAllTubes', {
    page,
    pageSize,
  })
  const res = response.data
  return {
    data: Array.isArray(res?.data) ? res.data : [],
    page: Number(res?.page ?? page),
    limit: Number(res?.limit ?? pageSize),
    total_count: Number(res?.total_count ?? 0),
  }
}

export interface GetFilteredTubesParams {
  page?: number
  pageSize?: number
  filters?: Record<string, string>
}

export async function getFilteredTubes({ page = 1, pageSize = 10, filters }: GetFilteredTubesParams): Promise<GetAllTubesResult> {
  const payload: any = { page, pageSize }
  if (filters && Object.keys(filters).length) payload.filters = filters
  const response = await api.post<GetAllTubesResponse>('/tests-tube/getAllTubes', payload)
  const res = response.data
  return {
    data: Array.isArray(res?.data) ? res.data : [],
    page: Number(res?.page ?? page),
    limit: Number(res?.limit ?? pageSize),
    total_count: Number(res?.total_count ?? 0),
  }
}

export async function getTubeByGuid(tubeGuid: string): Promise<GetTubeByGuidResponse> {
  const res = await api.get<GetTubeByGuidResponse>(`/tests-tube/getTubeByGuid/${tubeGuid}`)
  return res.data
}

export async function updateTubeByGuid(tubeGuid: string, formData: FormData): Promise<SaveTestTubeResponse> {
  const res = await api.patch<SaveTestTubeResponse>(`/tests-tube/updateTubeByGuid/${tubeGuid}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function deleteTubeByGuid(tubeGuid: string): Promise<SaveTestTubeResponse> {
  const res = await api.delete<SaveTestTubeResponse>(`/tests-tube/deleteTubeByGuid/${tubeGuid}`)
  return res.data
}
