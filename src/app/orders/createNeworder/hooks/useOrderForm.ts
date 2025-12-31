"use client"
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateField, resetOrder } from '../../../../store/ordersSlice'
import {
  SampleTypeEnum,
  OrderTypeEnum,
  UrgencyEnum,
  InsuranceRelationTypeEnum
} from '../../../../types/order'
import { ORDER_TYPE_OPTIONS, URGENCY_OPTIONS, INSURANCE_RELATION_OPTIONS } from '../../../../lib/orderEnums'

interface ValidationErrors {
  [key: string]: string[]
}

export function useOrderForm() {
  const dispatch = useAppDispatch()
  const order = useAppSelector((s: any) => s.orders)

  const setField = useCallback((section: 'personal' | 'caseInfo' | 'orderInfo' | 'insurance', field: string, value: any) => {
    // Handle mobile number validation
    if (field === 'mobile1' || field === 'mobile2') {
      const numericValue = value.replace(/\D/g, '')
      if (numericValue.length > 10) return // Don't update if more than 10 digits
      value = numericValue
    }

    dispatch(updateField({ section, field, value }))
  }, [dispatch])

  const clear = useCallback(() => dispatch(resetOrder()), [dispatch])

  const validateSection = useCallback((section: string): ValidationErrors => {
    const errors: ValidationErrors = {}

    switch (section) {
      case 'personal':
        const personal = order.personal || {}
        if (!personal.firstName?.trim()) errors.firstName = ['First name is required']
        if (!personal.lastName?.trim()) errors.lastName = ['Last name is required']
        if (!personal.gender?.trim()) errors.gender = ['Gender is required']
        if (!personal.dob?.trim()) errors.dob = ['Date of birth is required']
        if (!personal.mobile1?.trim()) errors.mobile1 = ['Mobile number is required']
        if (personal.mobile1 && personal.mobile1.length !== 10) errors.mobile1 = ['Mobile number must be 10 digits']
        if (personal.mobile2 && personal.mobile2.length !== 10) errors.mobile2 = ['Mobile number must be 10 digits']
        if (personal.email && personal.email.trim()) {
          const email = personal.email.trim()
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            errors.email = ['Invalid email address']
          }
        }
        if (!personal.address1?.trim()) errors.address1 = ['Address line 1 is required']
        if (!personal.city?.trim()) errors.city = ['City is required']
        if (!personal.state?.trim()) errors.state = ['State is required']
        if (!personal.zip?.trim()) errors.zip = ['Zip Code is required']
        if (personal.addPickupAddress !== true) {
          const hasAnyPickupField =
            !!personal.pickup_address1?.trim() ||
            !!personal.pickup_address2?.trim() ||
            !!personal.pickup_city?.trim() ||
            !!personal.pickup_state?.trim() ||
            !!personal.pickup_zip?.trim()

          if (!hasAnyPickupField) {
            const message = 'Pickup address is required'
            errors.pickup_address1 = [message]
            errors.addPickupAddress = [message]
          } else {
            if (!personal.pickup_address1?.trim()) {
              errors.pickup_address1 = ['Pickup Address Line 1 is required']
            }
            if (!personal.pickup_city?.trim()) {
              errors.pickup_city = ['Pickup City is required']
            }
            if (!personal.pickup_state?.trim()) {
              errors.pickup_state = ['Pickup State is required']
            }
            if (!personal.pickup_zip?.trim()) {
              errors.pickup_zip = ['Pickup Zip Code is required']
            }
          }
        }
        break

      case 'caseInfo':
        const caseInfo = order.caseInfo || {}
        if (!caseInfo.testName?.trim()) errors.testName = ['Test name is required']
        if (!caseInfo.orderingFacility?.trim()) errors.orderingFacility = ['Ordering facility is required']
        if (!caseInfo.orderingPhysician?.trim()) errors.orderingPhysician = ['Ordering physician is required']
        if (!caseInfo.services || (Array.isArray(caseInfo.services) && caseInfo.services.length === 0)) errors.services = ['Services is required']
        // ICD Codes must contain at least one selected code (array of strings)
        const icdArr = Array.isArray(caseInfo.icdCodes) ? caseInfo.icdCodes : []
        if (icdArr.length === 0) {
          errors.icdCodes = ['ICD code is required']
        }
        break

      case 'orderInfo':
        const orderInfo = order.orderInfo || {}
        const validOrderTypes = ORDER_TYPE_OPTIONS.map((o) => o.value) as unknown as readonly OrderTypeEnum[]
        if (!orderInfo.orderType || !validOrderTypes.includes(orderInfo.orderType as any))
          errors.orderType = ['Order type is required']
        if (!orderInfo.dateOfService)
          errors.dateOfService = ['Date of service is required']

        // Urgency is mandatory
        const validUrgency = URGENCY_OPTIONS.map((o) => o.value)
        if (!orderInfo.urgency || !validUrgency.includes(orderInfo.urgency)) {
          errors.urgency = ['Urgency is required']
        }

        // Fasting is now mandatory for all order types
        if (orderInfo.fasting === undefined || orderInfo.fasting === null) {
          errors.fasting = ['Fasting is required']
        }

        // For standing orders, start and end dates are mandatory
        if (orderInfo.orderType === 'STANDING ORDER') {
          if (orderInfo.startDate && orderInfo.endDate && orderInfo.endDate < orderInfo.startDate) {
            errors.endDate = ['End date can’t be before start date'];
          }
          if (!orderInfo.startDate) {
            errors.startDate = ['Start date is required for standing orders']
          }
          if (!orderInfo.endDate) {
            errors.endDate = ['Enter valid end date for standing orders']
          }
          if (!orderInfo.frequency?.trim()) {
            errors.frequency = ['Frequency is required for standing orders']
          }
        }
        break
      case 'insurance':
        const insurance = order.insurance || {}
        const orderInfoForBilling = order.orderInfo || {}
        const billing = String(orderInfoForBilling.billingType || '').trim()

        if (!billing) {
          errors.billingType = ['Billing type is required']
          return errors
        }
        if (billing !== 'INSURANCE') {
          return errors
        }
        const primary = String(insurance.primaryInsuranceGuid || '').trim()
        if (!primary) {
          errors.primaryInsuranceGuid = ['Insurance name is required']
        }

        const carrier = String(insurance.carrierCode || '').trim()
        if (!carrier) {
          errors.carrierCode = ['Carrier code is required']
        }

        const relation = String(insurance.primaryRelationship || '').trim()
        if (!relation) {
          errors.primaryRelationship = ['Relationship is required']
        }

        const primaryPolicyNumber = String(insurance.primaryPolicyNumber || '').trim()
        if (!primaryPolicyNumber) {
          errors.primaryPolicyNumber = ['Policy number is required']
        }

        // Primary Patient Details (Mandatory)
        if (!insurance.primaryPatientFirstName?.trim()) {
          errors.primaryPatientFirstName = ['First name is required']
        } else {
          const fn = insurance.primaryPatientFirstName.trim()
          if (/[^a-zA-Z\s]/.test(fn)) {
            errors.primaryPatientFirstName = ['First name must contain only letters']
          } else if (fn.length < 3) {
            errors.primaryPatientFirstName = ['First name must be at least 3 characters']
          }
        }

        if (!insurance.primaryPatientLastName?.trim()) {
          errors.primaryPatientLastName = ['Last name is required']
        } else {
          const ln = insurance.primaryPatientLastName.trim()
          if (/[^a-zA-Z\s]/.test(ln)) {
            errors.primaryPatientLastName = ['Last name must contain only letters']
          } else if (ln.length < 3) {
            errors.primaryPatientLastName = ['Last name must be at least 3 characters']
          }
        }
        if (!insurance.primaryPatientGender?.trim()) errors.primaryPatientGender = ['Gender is required']
        if (!insurance.primaryPatientDob?.trim()) errors.primaryPatientDob = ['Date of birth is required']
        if (!insurance.primaryPatientAddress1?.trim()) errors.primaryPatientAddress1 = ['Address line 1 is required']
        if (!insurance.primaryPatientZip?.trim()) errors.primaryPatientZip = ['Zip Code is required']
        if (!insurance.primaryPatientState?.trim()) errors.primaryPatientState = ['State is required']
        if (!insurance.primaryPatientCity?.trim()) errors.primaryPatientCity = ['City is required']

        // Validate secondary insurance fields if secondary insurance is enabled
        const secondaryInsuranceGuid = String(insurance.secondaryInsuranceGuid || '').trim()
        if (secondaryInsuranceGuid) {
          // Secondary Insurance Name is already present (secondaryInsuranceGuid)

          // Secondary Carrier Code
          const secondaryCarrierCode = String(insurance.secondaryCarrierCode || '').trim()
          if (!secondaryCarrierCode) {
            errors.secondaryCarrierCode = ['Secondary carrier code is required']
          }

          // Secondary Relationship
          const secondaryRelationship = String(insurance.secondaryRelationship || '').trim()
          if (!secondaryRelationship) {
            errors.secondaryRelationship = ['Secondary relationship is required']
          }

          // Secondary Policy Number
          const secondaryPolicyNumber = String(insurance.secondaryPolicyNumber || '').trim()
          if (!secondaryPolicyNumber) {
            errors.secondaryPolicyNumber = ['Secondary policy number is required']
          }

          // Secondary Patient Details (Mandatory if Secondary is selected)
          if (!insurance.secondaryPatientFirstName?.trim()) errors.secondaryPatientFirstName = ['First name is required']
          if (!insurance.secondaryPatientLastName?.trim()) errors.secondaryPatientLastName = ['Last name is required']
          if (!insurance.secondaryPatientGender?.trim()) errors.secondaryPatientGender = ['Gender is required']
          if (!insurance.secondaryPatientDob?.trim()) errors.secondaryPatientDob = ['Date of birth is required']
          if (!insurance.secondaryPatientAddress1?.trim()) errors.secondaryPatientAddress1 = ['Address line 1 is required']
          if (!insurance.secondaryPatientZip?.trim()) errors.secondaryPatientZip = ['Zip Code is required']
          if (!insurance.secondaryPatientState?.trim()) errors.secondaryPatientState = ['State is required']
          if (!insurance.secondaryPatientCity?.trim()) errors.secondaryPatientCity = ['City is required']
        }

        return errors

      default:
        break

    }

    return errors
  }, [order])

  const canProceedToNextSection = useCallback((currentSection: string): boolean => {
    const errors = validateSection(currentSection)
    return Object.keys(errors).length === 0
  }, [validateSection])

  const clearField = useCallback((section: 'personal' | 'caseInfo' | 'orderInfo' | 'insurance', field: string) => {
    dispatch(updateField({ section, field, value: null }))
  }, [dispatch])

  return {
    order,
    setField,
    clear,
    validateSection,
    canProceedToNextSection,
    clearField
  }
}
