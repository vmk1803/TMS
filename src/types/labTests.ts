export type SampleType = 'BLOOD' | 'URINE' | 'SALIVA' | 'SWAB' | 'OTHER'

export interface LabTest {
  id: number
  guid: string
  test_name: string
  test_code: string
  sample_type: SampleType | string
  tube_name?: string | null
  tat_minutes: number
  fasting: boolean
  case_type: string
  description: string
  notes: string
  is_deleted?: boolean
  created_at?: string
  updated_at?: string
  created_by?: string | null
  updated_by?: string | null
  icd_codes?: string[] | null
  services: string[]
}

export interface GetAllLabTestsRequest {
  page?: number
  pageSize?: number
  filters?: Record<string, string>
  sortBy?: string
  sortorder?: string
}

export interface GetAllLabTestsResponse {
  status: number
  message: string
  page: number
  limit: number
  total_count: number
  data: LabTest[]
}

export interface CreateLabTestRequest {
  test_name: string
  test_code: string
  sample_type: string
  tube_name?: string
  tat_minutes: number
  fasting: boolean
  active?: boolean
}

export interface CreateLabTestResponse {
  status: number
  message: string
  data?: Partial<LabTest>
}

export interface GetTestByGuidResponse {
  message: string
  data:any
}

export type UpdateLabTestRequest = Partial<{
  test_name: string
  test_code: string
  sample_type: string
  tube_name: string
  tat_minutes: number
  fasting: boolean
  active: boolean
  case_type: string
  description: string
  notes: string
}>

export interface UpdateLabTestResponse {
  status?: number
  message: string
}

export interface DeleteLabTestResponse {
  status?: number
  message: string
  success?: boolean
}

export interface AddNewLabTestProps {
  guidProp?: string
}