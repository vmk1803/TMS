/**
 * Types describing the create/update payload for orders — derived from DB schema
 */
export type GenderEnum = 'MALE' | 'FEMALE';
export type SampleTypeEnum = 'BLOOD' | 'URINE' | 'SALIVA' | 'SWAB' | 'OTHER';
// Added 'Lab Test' to accept order types coming from the form payload
export type OrderTypeEnum = 'STANDING ORDER' | 'RETURN VISIT' | 'ONE VISIT' | 'RECOLLECTION' | 'Lab Test';
export type UrgencyEnum = 'STAT' | 'ROUTINE';
export type InsuranceRelationTypeEnum =
  | 'ADOPTED CHILD'
  | 'CADAVER DONOR'
  | 'CHILD'
  | 'CHILD WHERE INSURED HAS NO FINANCIAL RESPONSIBILITY'
  | 'DEPENDENT OF A MINOR DEPENDENT'
  | 'EMANCIPATED MINOR'
  | 'EMPLOYEE'
  | 'FATHER'
  | 'FOSTER CHILD'
  | 'GRANDFATHER OR GRANDMOTHER'
  | 'GRANDSON OR GRANDDAUGHTER'
  | 'HANDICAPPED DEPENDENT'
  | 'INJURED PLAINTIFF'
  | 'LIFE PARTNER'
  | 'MOTHER'
  | 'NEPHEW OR NIECE'
  | 'ORGAN DONOR'
  | 'OTHER ADULT'
  | 'OTHER RELATIONSHIP'
  | 'SELF'
  | 'SIGNIFICANT OTHER'
  | 'SPONSORED DEPENDENT'
  | 'SPOUSE'
  | 'STEPSON OR STEPDAUGHTER'
  | 'UNKNOWN'
  | 'WARD'
  ;
export type BillingEnum = 'CLIENT' | 'PATIENT' | 'INSURANCE';
export interface PatientData {
  first_name: string
  middle_name?: string
  last_name: string
  gender: GenderEnum
  date_of_birth: string
  phone_no1: string
  phone_no2?: string
  email?: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  zipcode: string
  race?: string
  ethnicity?: string
  home_bound_status?: boolean
  hard_stick?: boolean
  patient_notes?: string
}

export interface InsurancePatientData {
  first_name: string
  middle_name?: string
  last_name: string
  gender: GenderEnum
  date_of_birth: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  zipcode: string
  // Primary insurance fields (when used in primary_insurance_patient)
  primary_insurance?: string | null
  primary_insurance_policy_number?: string | null
  primary_insurance_group_number?: string | null
  primary_insurance_relationship?: InsuranceRelationTypeEnum | null
  primary_insurance_plan_type?: string
  // Secondary insurance fields (when used in secondary_insurance_patient)
  secondary_insurance?: string | null
  secondary_insurance_policy_number?: string | null
  secondary_insurance_group_number?: string | null
  secondary_insurance_relationship?: InsuranceRelationTypeEnum | null
  secondary_insurance_plan_type?: string
}

export interface TubeDataItem {
  tube_name: string
  tube_count: number
}

export interface Test {
  id: number
  guid: string
  test_name: string
  test_code: string
  sample_type: string
  tat_minutes: number
  fasting: boolean
  case_type: string
  description: string
  notes: string
  services: string[]
  tube_info?: {
    id: number
    guid: string
    quantity?: string
    image_url?: string
    tube_name: string
    created_at?: string
    created_by?: string | null
    is_deleted?: boolean
    updated_at?: string
    updated_by?: string | null
    storage_temperature?: string | null
    special_instructions?: string | null
  }[]
}

export interface TestsResponse {
  status: number
  message: string
  page: number
  limit: number
  total_count: number
  data: Test[]
}

export interface Insurance {
  id: number
  guid: string
  name: string
  insurance_code?: string
}

export interface DashboardColumnConfig {
  key: string
  header: string
  extract?: (order: any) => string
}

export const DASHBOARD_EXPORT_COLUMNS: DashboardColumnConfig[] = [
  { key: 'phlebio_order_id', header: 'Order Number', extract: (o) => o?.phlebio_order_id ?? '' },
  { key: 'patient_name', header: 'Patient Name', extract: (o) => `${o?.patient?.first_name ?? ''} ${o?.patient?.middle_name ?? ''} ${o?.patient?.last_name ?? ''}`.trim() },
  { key: 'date_of_birth', header: 'DOB', extract: (o) => o?.patient?.date_of_birth ? new Date(o.patient.date_of_birth).toLocaleDateString('en-US').replace(/\//g, '-') : '' },
  { key: 'order_type', header: 'Order Type', extract: (o) => o?.order_type ?? '' },
  { key: 'urgency', header: 'Urgency', extract: (o) => o?.urgency ?? '' },
  { key: 'fasting', header: 'Fasting', extract: (o) => o?.fasting ? 'Yes' : 'No' },
  { key: 'tat', header: 'TAT', extract: (o) => o?.tat_minutes ?? '' },
  { key: 'test_name', header: 'Lab Tests', extract: (o) => (o?.test_info ?? []).map((t: any) => t?.test_code).filter(Boolean).join(', ') },
  { key: 'partner_name', header: 'Ordering Facility', extract: (o) => o?.partner?.name ?? '' },
  { key: 'physician_name', header: 'Physician', extract: (o) => `${o?.physician?.first_name ?? ''} ${o?.physician?.last_name ?? ''}`.trim() },
  { key: 'created_at', header: 'Order Date', extract: (o) => o?.created_at ? new Date(o.created_at).toLocaleDateString('en-US').replace(/\//g, '-') : '' },
  { key: 'date_of_service', header: 'Service Date', extract: (o) => o?.date_of_service ? new Date(o.date_of_service).toLocaleDateString('en-US').replace(/\//g, '-') : '' },
  { key: 'service_address', header: 'Service Address', extract: (o) => o?.service_address ?? '' },
  { key: 'patient_address', header: 'Patient Address', extract: (o) => { const a = o?.patient_address; return a ? `${a.address_line1 ?? ''},${a.city ?? ''},${a.zipcode ?? ''}` : '' } },
  { key: 'technician', header: 'Technician', extract: (o) => o?.technician ?? '' },
  { key: 'lastServicedBy', header: 'Last Serviced By', extract: (o) => o?.lastServicedBy ?? o?.last_serviced_by ?? '' },
  { key: 'adminNotes', header: 'Admin Notes', extract: (o) => o?.adminNotes ?? o?.admin_notes ?? '' },
  { key: 'technicianNotes', header: 'Technician Notes', extract: (o) => o?.technicianNotes ?? o?.technician_notes ?? '' },
  { key: 'status', header: 'Status', extract: (o) => o?.status ?? '' },
]

export interface UploadDocumentPayload {
  name: string
  size?: number
  url?: string
}

export interface OrderPayload {
  // Patient Information
  patient_data: PatientData

  // Case Information
  // sample_type may not be provided by all form payloads — make optional
  sample_type?: SampleTypeEnum
  icd_code: string[]
  partner_guid: string | null
  order_type: OrderTypeEnum
  date_of_service: string
  appointment_time?: string
  urgency: UrgencyEnum
  fasting?: boolean
  reasons?: string[]
  order_notes?: string

  // Insurance Information
  // selected insurance carrier (guid from dropdown)
  primary_insurance?: string | null
  primary_insurance_policy_name?: string
  primary_insurance_policy_number: null
  primary_insurance_group_number: null
  // allow null/undefined when the form does not set a relationship
  primary_insurance_relationship?: InsuranceRelationTypeEnum | null
  primary_insurance_plan_type?: string
  primary_insurance_patient?: InsurancePatientData

  // Secondary Insurance Information
  secondary_insurance?: string | null
  secondary_insurance_policy_number?: string | null
  secondary_insurance_group_number?: string | null
  secondary_insurance_relationship?: InsuranceRelationTypeEnum | null
  secondary_insurance_plan_type?: string
  secondary_insurance_patient?: InsurancePatientData

  // Other Fields
  billing_type?: BillingEnum
  test_info?: string[]
  physician_guid?: string
  // Services selected in Case Information (single value)
  services?: string[]

  // Tube / Container summary for the order
  tube_data?: TubeDataItem[]

  // Optional Service (Pickup) Address (for visit/collection) - concatenated string
  // Backwards-compatible concatenated address
  service_address?: string
  // Prefer these detailed address fields when available
  service_address_line1?: string
  service_address_line2?: string
  service_city?: string
  service_state?: string
  service_zipcode?: string

  // Standing order schedule (only used when order_type is STANDING ORDER)
  standing_start_date?: string
  standing_end_date?: string
  standing_frequency?: string

  // Uploaded documents attached to the order
  attachments?: UploadDocumentPayload[]

  // Metadata for auditing
  created_by?: string
  updated_by?: string

  // For PATCH updates when patient data itself is unchanged
  patient_guid?: string
}
