import { useCallback, useEffect, useMemo, useState } from 'react'
import { getInsuranceById, updateInsurance } from '../services/insuranceService'
import { CreateInsuranceRequest, UpdateInsuranceRequest } from '../../../../types/Insurances'

export type EditInsuranceErrors = Partial<Record<keyof CreateInsuranceRequest, string>>

const emptyValues: CreateInsuranceRequest = {
  name: '',
  insurance_type: '',
  insurance_code: ''
}

export function useEditInsurance(guid?: string) {
  const [values, setValues] = useState<CreateInsuranceRequest>(emptyValues)
  const [initial, setInitial] = useState<CreateInsuranceRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<EditInsuranceErrors>({})
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!guid) return
      try {
        setLoading(true)
        const res = await getInsuranceById(guid)
        if (!active) return
        const d = res?.data
        const next: CreateInsuranceRequest = {
          name: d?.name ?? '',
          insurance_type: d?.insurance_type ?? '',
          insurance_code: d?.insurance_code ?? ''
        }
        setValues(next)
        setInitial(next)
      } catch (e) {
        if (!active) return
        setValues(emptyValues)
        setInitial(emptyValues)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [guid])

  const setField = useCallback((field: keyof CreateInsuranceRequest, value: string) => {
    setValues((p) => ({ ...p, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }, [])

  const validate = useCallback((v: CreateInsuranceRequest = values) => {
    const next: EditInsuranceErrors = {}
    if (!v.name?.trim()) next.name = 'Insurance name is required'
    if (!v.insurance_type?.trim()) next.insurance_type = 'Insurance type is required'
    if (!v.insurance_code?.trim()) next.insurance_code = 'Insurance code is required'
    return next
  }, [values])

  const payloadDiff: UpdateInsuranceRequest = useMemo(() => {
    if (!initial) return {}
    const diff: UpdateInsuranceRequest = {}
    ;(['name','insurance_type','insurance_code','status'] as const).forEach((k) => {
      if (initial[k] !== values[k]) {
        diff[k] = k === 'status' ? values[k].toUpperCase() : values[k]
      }
    })
    return diff
  }, [initial, values])

  const hasChanges = useMemo(() => Object.keys(payloadDiff).length > 0, [payloadDiff])

  const submitUpdate = useCallback(async () => {
    if (!guid) return false
    const vErrors = validate()
    setErrors(vErrors)
    if (Object.keys(vErrors).length) return false
    if (!hasChanges) return true
    try {
      setUpdating(true)
      await updateInsurance(guid, payloadDiff)
      setSuccess(true)
      return true
    } finally {
      setUpdating(false)
    }
  }, [guid, validate, hasChanges, payloadDiff])

  const resetSuccess = () => setSuccess(false)

  return { values, setField, errors, loading, updating, success, resetSuccess, submitUpdate, hasChanges }
}
