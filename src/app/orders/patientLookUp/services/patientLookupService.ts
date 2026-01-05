import api from '../../../../lib/api'

export interface PatientAddress {
  city?: string
  state?: string
  country?: string | null
  zipcode?: string
  address_line1?: string
  address_line2?: string | null
}

export interface Patient {
  guid: string
  first_name: string
  middle_name?: string
  last_name: string
  email?: string
  date_of_birth?: string
  home_bound_status?: boolean | null
  gender?: string
  phone_no1?: string
  phone_no2?: string
  race?: string
  ethnicity?: string
  hard_stick?: boolean
  patient_notes?: string
  addresses?: PatientAddress[]
}

export interface GetAllPatientsResponse {
  message?: string
  data?: {
    data: Patient[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    filters?: {
      full_name?: string
      date_of_birth?: string
    }
  }
}

export interface PatientFilters {
  full_name?: string
  date_of_birth?: string
}

export async function getAllPatients(filters: PatientFilters, page = 1, pageSize = 20): Promise<Patient[]> {
  try {
    const payload = {
      page,
      pageSize,
      filters: filters || {},
    }

    const res = await api.post<GetAllPatientsResponse>('/patients/getAllPatients', payload)
    const items = res?.data?.data?.data

    if (Array.isArray(items)) {
      return items
    }
    return []
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch patients')
  }
}
