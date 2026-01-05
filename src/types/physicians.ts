export interface PhysicianDTO {
  guid: string
  npi: string
  first_name: string
  middle_name?: string | null
  last_name: string
  email?: string | null
  fax?: string | null
  phone_number?: string | null
  address_line1?: string | null
  address_line2?: string | null
  zipcode?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  specialization?: string | null
  is_deleted?: boolean
  created_at?: string
  updated_at?: string
  created_by?: number | null
  updated_by?: number | null
} 
export interface AddPhysicianFormData {
  npiNumber: string
  firstName: string
  middleName: string
  lastName: string
  phone_number: string
  email: string
  fax: string
  address1: string
  address2: string
  city: string
  zip: string
  state: string
  country: string
  specialization: string
  faxEnabled: boolean
  emailNotification: boolean
  orderingFacilities: string[]
  partnerGuids: string[]
}

export interface PhysiciansResponse {
  data: PhysicianDTO[]
  total?: number
  page?: number
  pageSize?: number
  totalPages?: number
}

export interface PhysicianCreatePayload {
  npi: string
  partner_guid: string[]
  first_name: string
  middle_name?: string | null
  last_name: string
  email?: string | null
  fax?: string | null
  address_line1: string
  address_line2?: string | null
  zipcode: string
  city: string
  state: string
  country: string
  specialization?: string | null
  ordering_facility_fax: boolean
  email_notification: boolean
  phone_number?: string | null
}
