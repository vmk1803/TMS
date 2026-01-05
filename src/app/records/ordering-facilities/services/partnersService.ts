import api from '../../../../lib/api'
import { GetPartnersParams } from '../../../../types/partner'
import type { PartnersResponse } from '../types/partner'

export async function getPartners(params: GetPartnersParams): Promise<PartnersResponse> {
  const { page, pageSize, filters } = params
  const payload: any = { page, pageSize }
  if (filters && Object.keys(filters).length > 0) {
    payload.filters = filters
  }
  const res = await api.post('/partners/getAllPartners', payload)
  return res.data as PartnersResponse
}

export async function savePartner(payload: any): Promise<any> {
  const res = await api.post('/partners/savePartner', payload)
  return res.data
}

export async function deletePartner(partnerGuid: string): Promise<any> {
  const res = await api.delete(`/partners/deletePartner/${partnerGuid}`)
  return res.data
}

export async function getPartnerByGuid(guid: string): Promise<any> {
  const res = await api.get(`/partners/getPartnerByGuid/${guid}`)
  return res.data
}

export async function updatePartner(guid: string, payload: any): Promise<any> {
  const res = await api.put(`/partners/updatePartner/${guid}`, payload)
  return res.data
}