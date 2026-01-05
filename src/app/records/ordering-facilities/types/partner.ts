export interface PartnerType {
  guid: string
  name: string
  created_at: string
  created_by: string | null
  is_deleted: boolean
  updated_at: string
  updated_by: string | null
  description?: string | null
}

export interface Partner {
  guid: string
  lis_id: string
  code: string
  name: string
  email: string
  phone: string
  website?: string
  fax?: string
  address_line1?: string
  address_line2?: string
  zipcode?: string
  city?: string
  state?: string
  country?: string
  contact_person?: string
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  is_deleted?: boolean
  partner_type?: PartnerType
}

export interface PartnersResponse {
  data: Partner[]
  total: number
  totalRecords?: number
  page: number
  pageSize: number
  totalPages: number
}
