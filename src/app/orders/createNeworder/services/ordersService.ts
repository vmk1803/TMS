import api from '../../../../lib/api'
import type {
  OrderPayload,
  SampleTypeEnum,
  OrderTypeEnum,
  UrgencyEnum,
  InsuranceRelationTypeEnum,
  BillingEnum,
  TestsResponse,
  Test,
  GenderEnum,
  TubeDataItem,
} from '../../../../types/order'

export async function saveOrderApi(payload: OrderPayload) {
  const res = await api.post('/orders/saveOrder', uppercaseOrderPayload(payload))
  return res.data
}

export async function updateOrderApi(orderGuid: string, payload: Partial<OrderPayload>) {
  const res = await api.patch(`/orders/updateOrderByGuid/${orderGuid}`, uppercaseOrderPayload(payload))
  return res.data
}

// Helper: recursively uppercase string values in the order payload
function uppercaseOrderPayload<T>(input: T): T {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const shouldExcludeKey = (k?: string) => {
    if (!k) return false
    const key = k.toLowerCase()
    return (
      key.includes('email') ||
      key.includes('password') ||
      key.includes('guid') ||
      key.includes('id') ||
      key.includes('uuid')
    )
  }

  const transform = (value: any, key?: string): any => {
    if (value === null || value === undefined) return value
    if (typeof value === 'string') {
      if (shouldExcludeKey(key)) return value
      if (emailRegex.test(value)) return value
      if (guidRegex.test(value)) return value
      return value.toUpperCase()
    }
    if (Array.isArray(value)) return value.map(v => transform(v))
    if (typeof value === 'object') {
      const out: any = {}
      for (const [k, v] of Object.entries(value)) {
        out[k] = transform(v, k)
      }
      return out
    }
    return value
  }

  try {
    return transform(input) as T
  } catch (e) {
    return input
  }
}

export async function getAllTests(): Promise<Test[]> {
  try {
    const response = await api.post<TestsResponse>('/tests/getAllTests', {
      page: 1,
      filters: {
        is_deleted: false
      }
    })

    return Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tests')
  }
}

export async function getAllPartners(): Promise<any[]> {
  try {
    const response = await api.post('/partners/getAllPartners', {
      page: 1,
      filters: { is_deleted: false },
    });

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch partners");
  }
}


export async function getAllInsurances(name?: string, page = 1, pageSize?): Promise<any[]> {
  try {
    const payload: any = {
      page,
      pageSize,
      filters: {
        is_deleted: false
      }
    };

    if (typeof name === 'string' && name.trim().length > 0) {
      payload.filters = { name: name.trim() }
    }
    const response = await api.post('/insurances/getAllInsurances', payload)

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    return []
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Insurnaces')
  }
}

export async function getOrderByGuid(orderGuid: string): Promise<any> {
  try {
    const response = await api.get(`/orders/getOrderByGuid/${orderGuid}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order')
  }
}


export async function getPhysiciansByPartnerGuid(partnerGuid: string): Promise<any[]> {
  try {
    const response = await api.get(`/partners/getPhysiciansByPartnerGuid/${partnerGuid}`)
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch physicians')
  }
}

export async function getIcdCodes(query?: string): Promise<any[]> {
  try {
    const response = await api.get('/labs/getIcdCodes', { params: { search: query ?? '' } })
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ICD codes')
  }
}



export function buildOrderPayload(state: any): OrderPayload {
  const { personal = {}, caseInfo = {}, orderInfo = {}, insurance = {} } = state

  // Extract user guid from localStorage
  let userGuid: string | undefined
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      // Handle nested structure: { user: { guid: ... } } or { guid: ... }
      userGuid = parsed?.user?.guid || parsed?.guid || undefined
    }
  } catch (error) {
    console.error('Error extracting user guid from localStorage:', error)
  }

  // Derive test GUIDs for payload directly from selectedTests
  const selectedTestsForGuids: Test[] = Array.isArray(caseInfo.selectedTests) ? caseInfo.selectedTests : []
  const finalTestInfo = selectedTestsForGuids
    .map((t: any) => t.guid)
    .filter((g: any) => !!g)

  // If billing type is not INSURANCE, clear all insurance-related fields
  const isInsuranceBilling = orderInfo.billingType === 'INSURANCE'

  const payload: OrderPayload = {
    // Patient Information
    patient_data: {
      first_name: personal.firstName ?? '',
      middle_name: personal.middleName,
      last_name: personal.lastName ?? '',
      gender: personal.gender as GenderEnum,
      date_of_birth: personal.dob ?? '',
      phone_no1: personal.mobile1 ?? '',
      phone_no2: personal.mobile2,
      email: personal.email,
      address_line1: personal.address1 ?? '',
      address_line2: personal.address2,
      city: personal.city ?? '',
      state: personal.state ?? '',
      zipcode: personal.zip ?? '',
      race: personal.race,
      ethnicity: personal.ethnicity,
      home_bound_status: personal.homebound ?? false,
      hard_stick: personal.hardStick ?? false,
      patient_notes: personal.patientNotes,
    },

    // Case Information
    sample_type: caseInfo.sampleType as SampleTypeEnum,
    icd_code: Array.isArray(caseInfo.icdCodes)
      ? caseInfo.icdCodes
      : (caseInfo.icdCodes || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    partner_guid: caseInfo.orderingFacility ?? null,
    physician_guid: caseInfo.orderingPhysician || undefined,
    order_type: orderInfo.orderType as OrderTypeEnum,
    date_of_service: orderInfo.dateOfService ?? '',
    appointment_time: orderInfo.appointmentTime,
    urgency: orderInfo.urgency as UrgencyEnum,
    fasting: !!orderInfo.fasting,
    reasons: Array.isArray(orderInfo.reasons) ? orderInfo.reasons : [],
    order_notes: orderInfo.warningNotes,

    // Insurance Information
    primary_insurance: isInsuranceBilling ? (insurance.primaryInsuranceGuid ?? '') : '',
    primary_insurance_policy_number: isInsuranceBilling ? (insurance.primaryPolicyNumber ?? '') : '',
    primary_insurance_group_number: isInsuranceBilling ? (insurance.primaryGroupNumber ?? '') : '',
    primary_insurance_relationship: isInsuranceBilling ? (insurance.primaryRelationship ?? '') : '',
    primary_insurance_plan_type: isInsuranceBilling ? (insurance.planType ?? '') : '',
    primary_insurance_patient: {
      first_name: isInsuranceBilling ? (insurance.primaryPatientFirstName ?? '') : '',
      middle_name: isInsuranceBilling ? (insurance.primaryPatientMiddleName ?? '') : '',
      last_name: isInsuranceBilling ? (insurance.primaryPatientLastName ?? '') : '',
      gender: isInsuranceBilling ? (insurance.primaryPatientGender ?? '') : '',
      date_of_birth: isInsuranceBilling ? (insurance.primaryPatientDob ?? '') : '',
      address_line1: isInsuranceBilling ? (insurance.primaryPatientAddress1 ?? '') : '',
      address_line2: isInsuranceBilling ? (insurance.primaryPatientAddress2 ?? '') : '',
      city: isInsuranceBilling ? (insurance.primaryPatientCity ?? '') : '',
      state: isInsuranceBilling ? (insurance.primaryPatientState ?? '') : '',
      zipcode: isInsuranceBilling ? (insurance.primaryPatientZip ?? '') : '',
      primary_insurance: isInsuranceBilling ? (insurance.primaryInsuranceName ?? '') : '',
      primary_insurance_policy_number: isInsuranceBilling ? (insurance.primaryPolicyNumber ?? '') : '',
      primary_insurance_group_number: isInsuranceBilling ? (insurance.primaryGroupNumber ?? '') : '',
      primary_insurance_relationship: isInsuranceBilling ? (insurance.primaryRelationship ?? '') : '',
      primary_insurance_plan_type: isInsuranceBilling ? (insurance.planType ?? '') : '',
    },
    billing_type: orderInfo.billingType,
    secondary_insurance: isInsuranceBilling ? (insurance.secondaryInsuranceGuid ?? '') : '',
    secondary_insurance_policy_number: isInsuranceBilling ? (insurance.secondaryPolicyNumber ?? '') : '',
    secondary_insurance_group_number: isInsuranceBilling ? (insurance.secondaryGroupNumber ?? '') : '',
    secondary_insurance_relationship: isInsuranceBilling ? (insurance.secondaryRelationship ?? '') : '',
    secondary_insurance_plan_type: isInsuranceBilling ? (insurance.secondaryPlanType ?? '') : '',
    secondary_insurance_patient: {
      first_name: isInsuranceBilling ? (insurance.secondaryPatientFirstName ?? '') : '',
      middle_name: isInsuranceBilling ? (insurance.secondaryPatientMiddleName ?? '') : '',
      last_name: isInsuranceBilling ? (insurance.secondaryPatientLastName ?? '') : '',
      gender: isInsuranceBilling ? (insurance.secondaryPatientGender ?? '') : '',
      date_of_birth: isInsuranceBilling ? (insurance.secondaryPatientDob ?? '') : '',
      address_line1: isInsuranceBilling ? (insurance.secondaryPatientAddress1 ?? '') : '',
      address_line2: isInsuranceBilling ? (insurance.secondaryPatientAddress2 ?? '') : '',
      city: isInsuranceBilling ? (insurance.secondaryPatientCity ?? '') : '',
      state: isInsuranceBilling ? (insurance.secondaryPatientState ?? '') : '',
      zipcode: isInsuranceBilling ? (insurance.secondaryPatientZip ?? '') : '',
      secondary_insurance: isInsuranceBilling ? (insurance.secondaryInsuranceName ?? '') : '',
      secondary_insurance_policy_number: isInsuranceBilling ? (insurance.secondaryPolicyNumber ?? '') : '',
      secondary_insurance_group_number: isInsuranceBilling ? (insurance.secondaryGroupNumber ?? '') : '',
      secondary_insurance_relationship: isInsuranceBilling ? (insurance.secondaryRelationship ?? '') : '',
      secondary_insurance_plan_type: isInsuranceBilling ? (insurance.secondaryPlanType ?? '') : '',
    },
    // Array of test GUIDs for the order
    test_info: finalTestInfo,
    services: Array.isArray(caseInfo.services) ? caseInfo.services : [],
    standing_start_date: orderInfo.orderType === 'STANDING ORDER' ? (orderInfo.startDate ?? '') : undefined,
    standing_end_date: orderInfo.orderType === 'STANDING ORDER' ? (orderInfo.endDate ?? '') : undefined,
    standing_frequency: orderInfo.orderType === 'STANDING ORDER' ? (orderInfo.frequency ?? '') : undefined,
    // attachments: Array.isArray(orderInfo.uploadDocuments)
    //   ? orderInfo.uploadDocuments
    //   : undefined,
    created_by: userGuid,
  }

  // Derive tube_data from selected tests (caseInfo.selectedTests)
  try {
    const selectedTests: Test[] = Array.isArray(caseInfo.selectedTests) ? caseInfo.selectedTests : []
    const tubeCounts: Record<string, number> = {}

    selectedTests.forEach((test: Test) => {
      if (!Array.isArray(test.tube_info)) return
      test.tube_info.forEach((tube) => {
        if (!tube || !tube.tube_name) return
        const key = String(tube.tube_name).trim()
        if (!key) return
        tubeCounts[key] = (tubeCounts[key] || 0) + 1
      })
    })

    const tube_data: TubeDataItem[] = Object.entries(tubeCounts).map(([tube_name, tube_count]) => ({
      tube_name,
      tube_count: tube_count > 4 ? 4 : tube_count,
    }))

    if (tube_data.length > 0) {
      payload.tube_data = tube_data
    }
  } catch {
    // fail-safe: ignore tube_data aggregation errors
  }

  // Optional service (pickup) address: prefer structured fields, keep concatenated string for compatibility
  const usePersonalAddr = personal.addPickupAddress === true

  const serviceLine1 = usePersonalAddr ? personal.address1 : personal.pickup_address1
  const serviceLine2 = usePersonalAddr ? personal.address2 : personal.pickup_address2
  const serviceCity = usePersonalAddr ? personal.city : personal.pickup_city
  const serviceState = usePersonalAddr ? personal.state : personal.pickup_state
  const serviceZip = usePersonalAddr ? personal.zip : personal.pickup_zip

  // set structured fields on payload
  if (typeof serviceLine1 === 'string' && serviceLine1.trim().length > 0) payload.service_address_line1 = serviceLine1
  if (typeof serviceLine2 === 'string' && serviceLine2.trim().length > 0) payload.service_address_line2 = serviceLine2
  if (typeof serviceCity === 'string' && serviceCity.trim().length > 0) payload.service_city = serviceCity
  if (typeof serviceState === 'string' && serviceState.trim().length > 0) payload.service_state = serviceState
  if (typeof serviceZip === 'string' && serviceZip.trim().length > 0) payload.service_zipcode = serviceZip

  // also keep legacy concatenated `service_address` for backward compatibility
  const serviceAddressParts = [serviceLine1, serviceLine2, serviceCity, serviceState, serviceZip]
  const filteredServiceAddressParts = serviceAddressParts.filter(
    (p: string | undefined | null) => typeof p === 'string' && p.trim().length > 0
  )
  if (filteredServiceAddressParts.length > 0) {
    payload.service_address = filteredServiceAddressParts.join(' ')
  }

  // Add derived fields for display (will be uppercased by uppercase transform)
  (payload as any).patient_name = `${personal.firstName ?? ''} ${personal.middleName ?? ''} ${personal.lastName ?? ''}`.trim()

  // Ensure physician_name is always sent (even if orderingPhysicianName wasn't explicitly set)
  if (caseInfo.orderingPhysicianName) {
    (payload as any).physician_name = caseInfo.orderingPhysicianName
  }

  return payload
}

function shallowEqual(a: any, b: any) {
  const aKeys = Object.keys(a || {})
  const bKeys = Object.keys(b || {})
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function buildOrderUpdatePayload(
  currentState: { personal: any; caseInfo: any; orderInfo: any; insurance: any },
  originalState: { personal: any; caseInfo: any; orderInfo: any; insurance: any },
  patientGuid: string | null
): Partial<OrderPayload> {
  const { personal = {}, caseInfo = {}, orderInfo = {}, insurance = {} } = currentState
  const {
    personal: originalPersonal = {},
    caseInfo: originalCaseInfo = {},
    orderInfo: originalOrderInfo = {},
    insurance: originalInsurance = {},
  } = originalState

  const fullCurrentPayload = buildOrderPayload({ personal, caseInfo, orderInfo, insurance })

  const updatePayload: Partial<OrderPayload> = {}

  // patient_data: full object if any personal field changed, else only patient_guid
  const currentPatientData = fullCurrentPayload.patient_data

  const originalPatientData: any = {
    first_name: originalPersonal.firstName ?? '',
    middle_name: originalPersonal.middleName,
    last_name: originalPersonal.lastName ?? '',
    gender: originalPersonal.gender,
    date_of_birth: originalPersonal.dob ?? '',
    phone_no1: originalPersonal.mobile1 ?? '',
    phone_no2: originalPersonal.mobile2,
    email: originalPersonal.email,
    address_line1: originalPersonal.address1 ?? '',
    address_line2: originalPersonal.address2,
    city: originalPersonal.city ?? '',
    state: originalPersonal.state ?? '',
    zipcode: originalPersonal.zip ?? '',
    race: originalPersonal.race,
    ethnicity: originalPersonal.ethnicity,
    home_bound_status: originalPersonal.homebound ?? false,
    hard_stick: originalPersonal.hardStick ?? false,
    patient_notes: originalPersonal.patientNotes,
  }

  const personalChanged = !shallowEqual(currentPatientData, originalPatientData)

  if (personalChanged) {
    updatePayload.patient_data = currentPatientData
    if (patientGuid) {
      // also send patient_guid so backend always knows the original patient
      updatePayload.patient_guid = patientGuid
    }
  } else if (patientGuid) {
    // nothing in personal changed: send only top-level patient_guid
    updatePayload.patient_guid = patientGuid
  }

  // Build original payload in the same way to compare derived fields correctly
  const fullOriginalPayload = buildOrderPayload({
    personal: originalPersonal,
    caseInfo: originalCaseInfo,
    orderInfo: originalOrderInfo,
    insurance: originalInsurance,
  })

  // helper to conditionally copy top-level fields if changed compared to original
  const copyIfChanged = <K extends keyof OrderPayload>(
    key: K,
    currentValue: OrderPayload[K],
    originalValue: OrderPayload[K]
  ) => {
    const cur = currentValue as any
    const orig = originalValue as any

    // If both current and original values are null, undefined, or empty strings, don't include in payload
    const isEmpty = (value: any) => value === null || value === undefined || value === ''
    if (isEmpty(cur) && isEmpty(orig)) {
      return
    }

    const isArrayCur = Array.isArray(cur)
    const isArrayOrig = Array.isArray(orig)

    if (isArrayCur || isArrayOrig) {
      const a = Array.isArray(cur) ? cur : []
      const b = Array.isArray(orig) ? orig : []
      if (a.length !== b.length) {
        ; (updatePayload as any)[key] = cur
        return
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          ; (updatePayload as any)[key] = cur
          return
        }
      }
      return
    }

    if (cur !== orig) {
      ; (updatePayload as any)[key] = cur
    }
  }

  // Case Information & others (compare against original payload values)
  copyIfChanged('sample_type', fullCurrentPayload.sample_type, fullOriginalPayload.sample_type)
  copyIfChanged('icd_code', fullCurrentPayload.icd_code, fullOriginalPayload.icd_code)
  copyIfChanged('partner_guid', fullCurrentPayload.partner_guid, fullOriginalPayload.partner_guid)
  copyIfChanged('physician_guid', fullCurrentPayload.physician_guid, fullOriginalPayload.physician_guid)

  // Order Information
  copyIfChanged('order_type', fullCurrentPayload.order_type, fullOriginalPayload.order_type)
  copyIfChanged('date_of_service', fullCurrentPayload.date_of_service, fullOriginalPayload.date_of_service)
  copyIfChanged('appointment_time', fullCurrentPayload.appointment_time, fullOriginalPayload.appointment_time)
  copyIfChanged('urgency', fullCurrentPayload.urgency, fullOriginalPayload.urgency)
  copyIfChanged('fasting', fullCurrentPayload.fasting, fullOriginalPayload.fasting)
  copyIfChanged('reasons', fullCurrentPayload.reasons, fullOriginalPayload.reasons)
  copyIfChanged('order_notes', fullCurrentPayload.order_notes, fullOriginalPayload.order_notes)
  copyIfChanged('standing_start_date', fullCurrentPayload.standing_start_date as any, fullOriginalPayload.standing_start_date as any)
  copyIfChanged('standing_end_date', fullCurrentPayload.standing_end_date as any, fullOriginalPayload.standing_end_date as any)
  copyIfChanged('standing_frequency', fullCurrentPayload.standing_frequency as any, fullOriginalPayload.standing_frequency as any)

  // Insurance Information
  copyIfChanged('primary_insurance', fullCurrentPayload.primary_insurance, fullOriginalPayload.primary_insurance)
  copyIfChanged(
    'primary_insurance_policy_number',
    fullCurrentPayload.primary_insurance_policy_number,
    fullOriginalPayload.primary_insurance_policy_number
  )
  copyIfChanged(
    'primary_insurance_group_number',
    fullCurrentPayload.primary_insurance_group_number,
    fullOriginalPayload.primary_insurance_group_number
  )
  copyIfChanged(
    'primary_insurance_relationship',
    fullCurrentPayload.primary_insurance_relationship,
    fullOriginalPayload.primary_insurance_relationship
  )
  copyIfChanged(
    'primary_insurance_plan_type',
    fullCurrentPayload.primary_insurance_plan_type as any,
    fullOriginalPayload.primary_insurance_plan_type as any
  )
  copyIfChanged('billing_type', fullCurrentPayload.billing_type, fullOriginalPayload.billing_type)

  // Secondary Insurance Information
  copyIfChanged('secondary_insurance', fullCurrentPayload.secondary_insurance, fullOriginalPayload.secondary_insurance)
  copyIfChanged(
    'secondary_insurance_policy_number',
    fullCurrentPayload.secondary_insurance_policy_number,
    fullOriginalPayload.secondary_insurance_policy_number
  )
  copyIfChanged(
    'secondary_insurance_group_number',
    fullCurrentPayload.secondary_insurance_group_number,
    fullOriginalPayload.secondary_insurance_group_number
  )
  copyIfChanged(
    'secondary_insurance_relationship',
    fullCurrentPayload.secondary_insurance_relationship,
    fullOriginalPayload.secondary_insurance_relationship
  )
  copyIfChanged(
    'secondary_insurance_plan_type',
    fullCurrentPayload.secondary_insurance_plan_type as any,
    fullOriginalPayload.secondary_insurance_plan_type as any
  )

  // Insurance Patient Data
  const primaryPatientDataChanged = !shallowEqual(
    fullCurrentPayload.primary_insurance_patient,
    fullOriginalPayload.primary_insurance_patient
  )
  if (primaryPatientDataChanged) {
    updatePayload.primary_insurance_patient = fullCurrentPayload.primary_insurance_patient
  }

  const secondaryPatientDataChanged = !shallowEqual(
    fullCurrentPayload.secondary_insurance_patient,
    fullOriginalPayload.secondary_insurance_patient
  )
  if (secondaryPatientDataChanged) {
    updatePayload.secondary_insurance_patient = fullCurrentPayload.secondary_insurance_patient
  }

  // Tests and services
  copyIfChanged('test_info', fullCurrentPayload.test_info, fullOriginalPayload.test_info)
  copyIfChanged('services', fullCurrentPayload.services, fullOriginalPayload.services)
  copyIfChanged('attachments', fullCurrentPayload.attachments as any, fullOriginalPayload.attachments as any)

  // Tube data is derived from selected tests; send it only when tests actually change
  const testsChanged = (() => {
    const a = Array.isArray(fullCurrentPayload.test_info) ? fullCurrentPayload.test_info : []
    const b = Array.isArray(fullOriginalPayload.test_info) ? fullOriginalPayload.test_info : []
    if (a.length !== b.length) return true
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return true
    }
    return false
  })()

  if (testsChanged && fullCurrentPayload.tube_data) {
    updatePayload.tube_data = fullCurrentPayload.tube_data
  }
  // Service/pickup address: copy detailed fields if changed (keep concatenated for compatibility)
  copyIfChanged('service_address_line1', fullCurrentPayload.service_address_line1 as any, fullOriginalPayload.service_address_line1 as any)
  copyIfChanged('service_address_line2', fullCurrentPayload.service_address_line2 as any, fullOriginalPayload.service_address_line2 as any)
  copyIfChanged('service_city', fullCurrentPayload.service_city as any, fullOriginalPayload.service_city as any)
  copyIfChanged('service_state', fullCurrentPayload.service_state as any, fullOriginalPayload.service_state as any)
  copyIfChanged('service_zipcode', fullCurrentPayload.service_zipcode as any, fullOriginalPayload.service_zipcode as any)
  copyIfChanged('service_address', fullCurrentPayload.service_address as any, fullOriginalPayload.service_address as any)

  // Check if any billing information has changed
  const billingFieldsChanged =
    'billing_type' in updatePayload ||
    'primary_insurance' in updatePayload ||
    'primary_insurance_policy_number' in updatePayload ||
    'primary_insurance_group_number' in updatePayload ||
    'primary_insurance_relationship' in updatePayload ||
    'primary_insurance_plan_type' in updatePayload ||
    'primary_insurance_patient' in updatePayload ||
    'secondary_insurance' in updatePayload ||
    'secondary_insurance_policy_number' in updatePayload ||
    'secondary_insurance_group_number' in updatePayload ||
    'secondary_insurance_relationship' in updatePayload ||
    'secondary_insurance_plan_type' in updatePayload ||
    'secondary_insurance_patient' in updatePayload

  // Add has_billing_updated flag if any billing field changed
  if (billingFieldsChanged) {
    (updatePayload as any).has_billing_updated = true
  }

  // updated_by for audit on edit
  // try {
  //   let userGuidForUpdate: string | undefined
  //   const userData = localStorage.getItem('user')
  //   if (userData) {
  //     const parsed = JSON.parse(userData)
  //     userGuidForUpdate = parsed?.user?.guid || parsed?.guid || undefined
  //   }
  //   if (userGuidForUpdate) {
  //     updatePayload.updated_by = userGuidForUpdate
  //   }
  // } catch {
  //   // ignore audit extraction errors
  // }

  return updatePayload
}

export async function getStateByZip(zipCode: string): Promise<any> {
  try {
    const response = await api.get(`/labs/getStatesByZipCode/${zipCode}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch state by zip code");
  }
}