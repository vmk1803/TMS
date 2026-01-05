import { useState } from 'react'
import { createInsurance } from '../services/insuranceService'
import { CreateInsuranceRequest } from '../../../../types/Insurances'

export type CreateInsuranceErrors = Partial<Record<keyof CreateInsuranceRequest, string>>

export function useCreateInsurance() {
  const [values, setValues] = useState<CreateInsuranceRequest>({
    name: '',
    insurance_type: '',
    insurance_code: ''
  })
  const [errors, setErrors] = useState<CreateInsuranceErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const setField = (field: keyof CreateInsuranceRequest, value: string) => {
    setValues((p) => ({ ...p, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (v: CreateInsuranceRequest = values) => {
    const next: CreateInsuranceErrors = {}
    if (!v.name?.trim()) next.name = 'Insurance name is required'
    if (!v.insurance_type?.trim()) next.insurance_type = 'Insurance type is required'
    if (!v.insurance_code?.trim()) next.insurance_code = 'Insurance code is required'
    return next
  }

  const submit = async () => {
    const vErrors = validate()
    setErrors(vErrors)
    if (Object.keys(vErrors).length) return false

    try {
      setSubmitting(true)
      // Ensure status in API is uppercase as required
      const payload: CreateInsuranceRequest = {
        ...values
      }
      await createInsurance(payload)
      setSuccess(true)
      return true
    } catch (e) {
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  const resetSuccess = () => setSuccess(false)

  return { values, errors, submitting, success, setField, submit, resetSuccess }
}
