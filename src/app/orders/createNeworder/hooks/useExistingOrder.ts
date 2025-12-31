'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateField, setOriginalSnapshot } from '../../../../store/ordersSlice'
import { getOrderByGuid } from '../services/ordersService'

export function useExistingOrder() {
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const storedOrderGuid = useAppSelector((state) => state.orders.orderGuid)
  const storedMode = useAppSelector((state) => state.orders.mode)
  const orderGuid = searchParams.get('orderGuid')
  const mode = searchParams.get('mode')

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!orderGuid) return
      try {
        const res = await getOrderByGuid(orderGuid)
        if (!active || !res) return

        const order = Array.isArray(res.data) ? res.data[0] : (res.data || res)
        if (!order) return

        const patient = order.patient || {}
        const patientAddress = order.patient_address || {}

        // --- Personal (Step 1) ---
        dispatch(updateField({ section: 'personal', field: 'firstName', value: patient.first_name || '' }))
        dispatch(updateField({ section: 'personal', field: 'middleName', value: patient.middle_name || '' }))
        dispatch(updateField({ section: 'personal', field: 'lastName', value: patient.last_name || '' }))
        dispatch(updateField({ section: 'personal', field: 'gender', value: patient.gender || '' }))
        dispatch(updateField({ section: 'personal', field: 'dob', value: patient.date_of_birth || '' }))
        dispatch(updateField({ section: 'personal', field: 'mobile1', value: patient.phone_no1 || '' }))
        dispatch(updateField({ section: 'personal', field: 'mobile2', value: patient.phone_no2 || '' }))
        dispatch(updateField({ section: 'personal', field: 'email', value: patient.email || '' }))
        dispatch(updateField({ section: 'personal', field: 'address1', value: patientAddress.address_line1 || '' }))
        dispatch(updateField({ section: 'personal', field: 'address2', value: patientAddress.address_line2 || '' }))
        dispatch(updateField({ section: 'personal', field: 'city', value: patientAddress.city || '' }))
        dispatch(updateField({ section: 'personal', field: 'state', value: patientAddress.state || '' }))
        dispatch(updateField({ section: 'personal', field: 'zip', value: patientAddress.zipcode || '' }))
        dispatch(updateField({ section: 'personal', field: 'country', value: patientAddress.country || '' }))

        // extra personal details - normalize race and ethnicity (case-insensitive matching)
        const RACE_OPTIONS = [
          "American Indian or Alaska Native",
          "Asian",
          "Black or African American",
          "Native Hawaiian or Other Pacific Islander",
          "White",
          "Other Race",
        ]
        const ETHNICITY_OPTIONS = [
          "Ashkenazi Jewish",
          "Asian",
          "Black/African",
          "American",
          "Hispanic or Latino",
          "Hispanic",
          "Native American",
          "Not Hispanic or Latino",
          "Other",
          "Pacific Islander",
          "Unknown",
          "White/Caucasian",
        ]

        // Normalize race (case-insensitive)
        let normalizedRace = ''
        if (patient.race) {
          const matchedRace = RACE_OPTIONS.find(opt =>
            opt.toLowerCase() === patient.race.toLowerCase()
          )
          normalizedRace = matchedRace || patient.race
        }

        // Normalize ethnicity (case-insensitive)
        let normalizedEthnicity = ''
        if (patient.ethnicity) {
          const matchedEthnicity = ETHNICITY_OPTIONS.find(opt =>
            opt.toLowerCase() === patient.ethnicity.toLowerCase()
          )
          normalizedEthnicity = matchedEthnicity || patient.ethnicity
        }

        dispatch(updateField({ section: 'personal', field: 'race', value: normalizedRace }))
        dispatch(updateField({ section: 'personal', field: 'ethnicity', value: normalizedEthnicity }))
        dispatch(updateField({ section: 'personal', field: 'hardStick', value: !!patient.hard_stick }))
        dispatch(updateField({ section: 'personal', field: 'homebound', value: !!patient.home_bound_status }))
        dispatch(updateField({ section: 'personal', field: 'patientNotes', value: patient.patient_notes || '' }))

        // Pickup/service address: prefer structured service address fields when present
        // Check if patient address and pickup address are the same
        const pickupAddr1 = order.service_address_line1 || order.service_address || ''
        const pickupAddr2 = order.service_address_line2 || ''
        const pickupCity = order.service_city || ''
        const pickupState = order.service_state || ''
        const pickupZip = order.service_zipcode || ''

        const addressesMatch = (
          pickupAddr1 === (patientAddress.address_line1 || '') &&
          pickupAddr2 === (patientAddress.address_line2 || '') &&
          pickupCity === (patientAddress.city || '') &&
          pickupState === (patientAddress.state || '') &&
          pickupZip === (patientAddress.zipcode || '')
        )

        dispatch(updateField({ section: 'personal', field: 'addPickupAddress', value: addressesMatch }))
        dispatch(updateField({ section: 'personal', field: 'pickup_address1', value: pickupAddr1 }))
        dispatch(updateField({ section: 'personal', field: 'pickup_address2', value: pickupAddr2 }))
        dispatch(updateField({ section: 'personal', field: 'pickup_city', value: pickupCity }))
        dispatch(updateField({ section: 'personal', field: 'pickup_state', value: pickupState }))
        dispatch(updateField({ section: 'personal', field: 'pickup_zip', value: pickupZip }))

        // --- Case Info (Step 2) ---
        const partner = order.partner || {}
        const physician = order.physician || {}

        const orderingFacilityGuid = partner.guid || ''
        const orderingPhysicianGuid = physician.guid || ''
        const orderingPhysicianName = [
          physician.first_name,
          physician.middle_name,
          physician.last_name,
        ].filter(Boolean).join(' ')

        dispatch(updateField({
          section: 'caseInfo',
          field: 'icdCodes',
          value: Array.isArray(order.icd_code) ? order.icd_code : (order.icd_code || [])
        }))
        dispatch(updateField({ section: 'caseInfo', field: 'orderingFacility', value: orderingFacilityGuid }))
        dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysician', value: orderingPhysicianGuid }))
        dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysicianName', value: orderingPhysicianName }))
        dispatch(updateField({ section: 'caseInfo', field: 'sampleType', value: order.sample_type || null }))

        // Normalize services: API returns uppercase (e.g., "STOOL SPECIMEN PICKUP") or array of strings
        // Convert to title case to match UI dropdown options (e.g., "Stool Specimen Pickup")
        let normalizedServices: string[] = []
        const rawServices = order.services

        // Valid service options in title case (as expected by the UI)
        const SERVICE_OPTIONS_LOCAL = [
          "Venipuncture Home Draw",
          "UA Specimen Pickup",
          "Stool Specimen Pickup",
          "Testing Ordering Facility",
        ]

        // Helper function to convert string to title case
        const toTitleCase = (str: string): string => {
          return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }

        if (Array.isArray(rawServices)) {
          normalizedServices = rawServices.map((s: string) => {
            const trimmed = s.trim()
            const matched = SERVICE_OPTIONS_LOCAL.find(opt => opt.toLowerCase() === trimmed.toLowerCase())
            return matched || toTitleCase(trimmed)
          })
        } else if (typeof rawServices === 'string' && rawServices.trim()) {
          const trimmed = rawServices.trim()
          const matchedOption = SERVICE_OPTIONS_LOCAL.find(opt =>
            opt.toLowerCase() === trimmed.toLowerCase()
          )
          normalizedServices = [matchedOption || toTitleCase(trimmed)]
        }

        dispatch(updateField({ section: 'caseInfo', field: 'services', value: normalizedServices }))

        const tests = Array.isArray(order.test_info) ? order.test_info : []

        const selectedTests = tests.map((t: any, idx: number) => ({
          id: t.test_id ?? idx,
          test_name: t.test_name,
          test_code: t.test_code,
          tube_info: t.tube_name ? [{ tube_name: t.tube_name }] : [],
          guid: t.test_guid,
        }))

        dispatch(updateField({ section: 'caseInfo', field: 'selectedTests', value: selectedTests }))
        const formatLabel = (tt: any) => {
          const firstTube = Array.isArray(tt.tube_info) && tt.tube_info.length > 0 ? tt.tube_info[0]?.tube_name : undefined
          return firstTube ? `${tt.test_name} - ${firstTube}` : (tt.test_name || '')
        }
        dispatch(updateField({ section: 'caseInfo', field: 'testName', value: selectedTests.map(formatLabel).filter(Boolean).join(', ') }))
        dispatch(updateField({ section: 'caseInfo', field: 'test_info', value: selectedTests.map((t: any) => t.guid).filter(Boolean) }))

        // --- Order Info (Step 3) ---
        // Normalize appointment_time: API returns "06:00 PM 08:00 PM" but UI expects "06:00 PM - 08:00 PM"
        let normalizedAppointmentTime = ''
        if (order.appointment_time && typeof order.appointment_time === 'string') {
          const apiTime = order.appointment_time.trim()
          // More robust approach: split by space and rejoin with hyphen between AM/PM parts
          const parts = apiTime.split(' ')
          if (parts.length === 4) {
            // Format: "06:00 PM 08:00 PM" -> parts = ["06:00", "PM", "08:00", "PM"]
            normalizedAppointmentTime = `${parts[0]} ${parts[1]} - ${parts[2]} ${parts[3]}`
          } else {
            // Fallback: try regex approach
            normalizedAppointmentTime = apiTime.replace(/(PM|AM)\s+(PM|AM)/, '$1 - $2')
          }
        } else {
          console.log('DEBUG - appointment_time is missing or not a string:', order.appointment_time)
        }

        dispatch(updateField({ section: 'orderInfo', field: 'orderType', value: order.order_type || '' }))
        dispatch(updateField({ section: 'orderInfo', field: 'dateOfService', value: order.date_of_service || '' }))
        dispatch(updateField({ section: 'orderInfo', field: 'appointmentTime', value: normalizedAppointmentTime }))
        dispatch(updateField({ section: 'orderInfo', field: 'urgency', value: order.urgency || '' }))
        dispatch(updateField({ section: 'orderInfo', field: 'fasting', value: !!order.fasting }))
        // the API response may include multiple fields for notes/warnings; prefer order_notes when present
        dispatch(
          updateField({
            section: 'orderInfo',
            field: 'warningNotes',
            value: order.order_notes || '',
          })
        )

        // Standing order schedule fields
        dispatch(updateField({ section: 'orderInfo', field: 'startDate', value: order.standing_start_date || '' }))
        dispatch(updateField({ section: 'orderInfo', field: 'endDate', value: order.standing_end_date || '' }))

        // Normalize frequency: API returns uppercase (e.g., "WEEKLY") but UI expects title case (e.g., "Weekly")
        let normalizedFrequency = ''
        if (order.standing_frequency) {
          const frequencyOptions = ['Daily', 'Weekly', 'Monthly']
          const matchedFrequency = frequencyOptions.find(opt =>
            opt.toLowerCase() === order.standing_frequency.toLowerCase()
          )
          normalizedFrequency = matchedFrequency || order.standing_frequency
        }
        dispatch(updateField({ section: 'orderInfo', field: 'frequency', value: normalizedFrequency }))

        // Upload documents (if any) from API response
        // API returns an array of URL strings
        const uploadDocsFromApi = Array.isArray(order.attachments)
          ? order.attachments.map((urlOrObj: any, index: number) => {
            // Handle both string URLs and object formats
            if (typeof urlOrObj === 'string') {
              // Extract filename from URL
              const fileName = urlOrObj.split('/').pop() || `Document ${index + 1}`
              return {
                name: fileName,
                url: urlOrObj,
                // No 'file' property - this indicates it's an existing attachment, not a new upload
              }
            } else {
              // Handle object format (fallback)
              return {
                name: urlOrObj.name || urlOrObj.file_name || urlOrObj.document_name || `Document ${index + 1}`,
                size: urlOrObj.size || urlOrObj.file_size,
                url: urlOrObj.url || urlOrObj.document_url || urlOrObj.path || urlOrObj.file_url,
              }
            }
          })
          : []

        if (uploadDocsFromApi.length > 0) {
          dispatch(updateField({ section: 'orderInfo', field: 'uploadDocuments', value: uploadDocsFromApi }))
        }

        // --- Insurance (Step 4) ---
        const primaryIns = order.primary_insurance || null
        const primaryInsuranceGuid = primaryIns && typeof primaryIns === 'object' ? primaryIns.guid : primaryIns
        const primaryInsuranceCodeFromObj = primaryIns && typeof primaryIns === 'object' ? primaryIns.insurance_code : ''
        const primaryInsuranceName = primaryIns && typeof primaryIns === 'object' ? primaryIns.name : ''

        dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceGuid', value: primaryInsuranceGuid || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceName', value: primaryInsuranceName || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPolicyNumber', value: order.primary_insurance_policy_number || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryGroupNumber', value: order.primary_insurance_group_number || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryRelationship', value: order.primary_insurance_relationship || '' }))
        dispatch(updateField({ section: 'insurance', field: 'carrierCode', value: primaryInsuranceCodeFromObj || '' }))
        dispatch(updateField({ section: 'insurance', field: 'planType', value: order.primary_insurance_plan_type || '' }))
        dispatch(updateField({ section: 'orderInfo', field: 'billingType', value: order.billing_type || '' }))

        // Secondary Insurance
        const secondaryIns = order.secondary_insurance || null
        const secondaryInsuranceGuid = secondaryIns && typeof secondaryIns === 'object' ? secondaryIns.guid : secondaryIns
        const secondaryInsuranceCodeFromObj = secondaryIns && typeof secondaryIns === 'object' ? secondaryIns.insurance_code : ''
        const secondaryInsuranceName = secondaryIns && typeof secondaryIns === 'object' ? secondaryIns.name : ''

        dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceGuid', value: secondaryInsuranceGuid || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceName', value: secondaryInsuranceName || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPolicyNumber', value: order.secondary_insurance_policy_number || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryGroupNumber', value: order.secondary_insurance_group_number || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryRelationship', value: order.secondary_insurance_relationship || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryCarrierCode', value: secondaryInsuranceCodeFromObj || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPlanType', value: order.secondary_insurance_plan_type || '' }))

        // Map Primary Insurance Patient Data
        const primPatient = order.primary_insurance_patient || {}
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientFirstName', value: primPatient.first_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientMiddleName', value: primPatient.middle_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientLastName', value: primPatient.last_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientGender', value: primPatient.gender || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientDob', value: primPatient.date_of_birth || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientAddress1', value: primPatient.address_line1 || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientAddress2', value: primPatient.address_line2 || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: primPatient.city || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientState', value: primPatient.state || '' }))
        dispatch(updateField({ section: 'insurance', field: 'primaryPatientZip', value: primPatient.zipcode || '' }))

        // Map Secondary Insurance Patient Data
        const secPatient = order.secondary_insurance_patient || {}
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientFirstName', value: secPatient.first_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientMiddleName', value: secPatient.middle_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientLastName', value: secPatient.last_name || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientGender', value: secPatient.gender || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientDob', value: secPatient.date_of_birth || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress1', value: secPatient.address_line1 || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress2', value: secPatient.address_line2 || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: secPatient.city || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientState', value: secPatient.state || '' }))
        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientZip', value: secPatient.zipcode || '' }))

        const patientGuid = (order.patient && order.patient.guid) ? order.patient.guid : null
        const guid = order.guid || order.order_guid || null

        const personalSnapshot: Record<string, any> = {
          firstName: patient.first_name || '',
          middleName: patient.middle_name || '',
          lastName: patient.last_name || '',
          gender: patient.gender || '',
          dob: patient.date_of_birth || '',
          mobile1: patient.phone_no1 || '',
          mobile2: patient.phone_no2 || '',
          email: patient.email || '',
          address1: patientAddress.address_line1 || '',
          address2: patientAddress.address_line2 || '',
          city: patientAddress.city || '',
          state: patientAddress.state || '',
          zip: patientAddress.zipcode || '',
          country: patientAddress.country || '',
          race: normalizedRace,
          ethnicity: normalizedEthnicity,
          hardStick: !!patient.hard_stick,
          homebound: !!patient.home_bound_status,
          patientNotes: patient.patient_notes || '',
          addPickupAddress: addressesMatch,
          pickup_address1: pickupAddr1,
          pickup_address2: pickupAddr2,
          pickup_city: pickupCity,
          pickup_state: pickupState,
          pickup_zip: pickupZip,
        }

        const caseInfoSnapshot: Record<string, any> = {
          icdCodes: Array.isArray(order.icd_code) ? order.icd_code : (order.icd_code || []),
          orderingFacility: orderingFacilityGuid,
          orderingPhysician: orderingPhysicianGuid,
          orderingPhysicianName,
          sampleType: order.sample_type || null,
          services: normalizedServices,
          selectedTests,
          testName: selectedTests.map((t: any) => {
            const firstTube = Array.isArray(t.tube_info) && t.tube_info.length > 0 ? t.tube_info[0]?.tube_name : undefined
            return firstTube ? `${t.test_name} - ${firstTube}` : (t.test_name || '')
          }).filter(Boolean).join(', '),
          test_info: selectedTests.map((t: any) => t.guid).filter(Boolean),
        }

        const orderInfoSnapshot: Record<string, any> = {
          orderType: order.order_type || '',
          dateOfService: order.date_of_service || '',
          appointmentTime: normalizedAppointmentTime,
          urgency: order.urgency || '',
          fasting: !!order.fasting,
          warningNotes: order.order_notes || '',
          billingType: order.billing_type || '',
          service_address: order.service_address || '',
          startDate: order.standing_start_date || '',
          endDate: order.standing_end_date || '',
          frequency: normalizedFrequency,
          uploadDocuments: uploadDocsFromApi,
        }

        const insuranceSnapshot: Record<string, any> = {
          primaryInsuranceGuid: primaryInsuranceGuid || '',
          primaryInsuranceName: primaryInsuranceName || '',
          primaryPolicyNumber: order.primary_insurance_policy_number || null,
          primaryGroupNumber: order.primary_insurance_group_number || null,
          primaryRelationship: order.primary_insurance_relationship || '',
          carrierCode: primaryInsuranceCodeFromObj || '',
          planType: order.primary_insurance_plan_type || '',
          secondaryInsuranceGuid: secondaryInsuranceGuid || '',
          secondaryInsuranceName: secondaryInsuranceName || '',
          secondaryPolicyNumber: order.secondary_insurance_policy_number || null,
          secondaryGroupNumber: order.secondary_insurance_group_number || null,
          secondaryRelationship: order.secondary_insurance_relationship || '',
          secondaryCarrierCode: secondaryInsuranceCodeFromObj || '',
          secondaryPlanType: order.secondary_insurance_plan_type || '',
          primaryPatientFirstName: order.primary_insurance_patient?.first_name || '',
          primaryPatientMiddleName: order.primary_insurance_patient?.middle_name || '',
          primaryPatientLastName: order.primary_insurance_patient?.last_name || '',
          primaryPatientGender: order.primary_insurance_patient?.gender || '',
          primaryPatientDob: order.primary_insurance_patient?.date_of_birth || '',
          primaryPatientAddress1: order.primary_insurance_patient?.address_line1 || '',
          primaryPatientAddress2: order.primary_insurance_patient?.address_line2 || '',
          primaryPatientCity: order.primary_insurance_patient?.city || '',
          primaryPatientState: order.primary_insurance_patient?.state || '',
          primaryPatientZip: order.primary_insurance_patient?.zipcode || '',
          secondaryPatientFirstName: order.secondary_insurance_patient?.first_name || '',
          secondaryPatientMiddleName: order.secondary_insurance_patient?.middle_name || '',
          secondaryPatientLastName: order.secondary_insurance_patient?.last_name || '',
          secondaryPatientGender: order.secondary_insurance_patient?.gender || '',
          secondaryPatientDob: order.secondary_insurance_patient?.date_of_birth || '',
          secondaryPatientAddress1: order.secondary_insurance_patient?.address_line1 || '',
          secondaryPatientAddress2: order.secondary_insurance_patient?.address_line2 || '',
          secondaryPatientCity: order.secondary_insurance_patient?.city || '',
          secondaryPatientState: order.secondary_insurance_patient?.state || '',
          secondaryPatientZip: order.secondary_insurance_patient?.zipcode || '',
        }

        dispatch(setOriginalSnapshot({
          personal: personalSnapshot,
          caseInfo: caseInfoSnapshot,
          orderInfo: orderInfoSnapshot,
          insurance: insuranceSnapshot,
          orderGuid: guid,
          patientGuid,
          mode: mode || null,
        }))
      } catch (e) {
      }
    }

    load()

    return () => {
      active = false
    }
  }, [orderGuid, dispatch])

  const isEditing = (!!orderGuid || !!storedOrderGuid) && (mode !== 'reorder' && storedMode !== 'reorder')

  return { isEditing }
}
