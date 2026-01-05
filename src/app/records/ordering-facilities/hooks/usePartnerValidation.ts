import { useCallback, useState } from 'react'

export type PartnerForm = {
  facilityName: string
  accountNumber: string
  mobileNumber: string
  fax: string
  email: string
  salesRep: string
  accountManager: string
  address1: string
  address2: string
  city: string
  zip: string
  state: string
  country: string
  emailNotification: boolean
}

export function validatePartnerForm(data: PartnerForm): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.facilityName?.trim()) errors.facilityName = 'Facility name is required'
  else if (/\d/.test(data.facilityName)) errors.facilityName = 'Facility name must not contain numbers'
  if (!data.accountNumber?.trim()) errors.accountNumber = 'Account number is required'
  // if (!data.salesRep?.trim()) errors.salesRep = 'Sales rep is required'
  // if (!data.accountManager?.trim()) errors.accountManager = 'Account manager is required'
  if (!data.address1?.trim()) errors.address1 = 'Address line 1 is required'
  if (!data.city?.trim()) errors.city = 'City is required'
  if (!data.state?.trim()) errors.state = 'State is required'
  if (!data.zip?.trim()) errors.zip = 'Zip Code is required'

  // Mobile number validation: if provided must contain only digits and be 10 digits long
  if (data.mobileNumber) {
    const m = String(data.mobileNumber).trim();
    if (!/^[0-9]+$/.test(m) || m.length !== 10) {
      errors.mobileNumber = 'Mobile number must be 10 digits';
    }
  }

  // Email validation: if provided must be valid format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    errors.email = 'Email is not valid'
  }
  return errors
}

export function usePartnerValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback((data: PartnerForm) => {
    const e = validatePartnerForm(data)
    setErrors(e)
    return e
  }, [])

  const clearError = useCallback((key: string) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }, [])

  return { errors, validate, clearError }
}
