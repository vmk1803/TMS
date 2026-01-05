export interface InsuranceDTO {
  id: number
  guid: string
  name: string
  email?: string
  phone_number?: string
  fax?: string
  insurance_type?: string
  insurance_code?: string
  website?: string
  zipcode?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  warning?: string
  notes?: string
  is_deleted?: boolean
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface CreateInsuranceRequest {
  name: string
  insurance_type: string
  insurance_code: string
}

export interface CreateInsuranceResponse {
  message?: string
  data?: InsuranceDTO
}

export type UpdateInsuranceRequest = Partial<CreateInsuranceRequest>

export interface GetInsuranceByIdResponse {
  message?: string
  data?: InsuranceDTO
}
