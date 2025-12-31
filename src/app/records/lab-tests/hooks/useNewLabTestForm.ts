"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createTest, getTestByGuid, updateTestByGuid } from '../services/labTestsService'

export interface LabTestFormData {
  testCode: string
  testName: string
  sampleType: string
  tubeName: string
  tat: string
  fasting: boolean
  active: boolean
}

export function useNewLabTestForm(guid?: string) {
  const [formData, setFormData] = useState<LabTestFormData>({
    testCode: '',
    testName: '',
    sampleType: '',
    tubeName: '',
    tat: '',
    fasting: false,
    active: false,
  })
  const [errors, setErrors] = useState<{ testCode?: string; testName?: string; sampleType?: string }>({})
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [original, setOriginal] = useState<LabTestFormData | null>(null)
  const isEditMode = Boolean(guid)

  const handleSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, sampleType: value }))
    setErrors((prev) => ({ ...prev, sampleType: '' }))
    setShowDropdown(false)
  }

  const handleChange = (key: keyof LabTestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (key === 'testCode' && value) setErrors((p) => ({ ...p, testCode: '' }))
    if (key === 'testName' && value) setErrors((p) => ({ ...p, testName: '' }))
    if (key === 'sampleType' && value) setErrors((p) => ({ ...p, sampleType: '' }))
  }

  const handleBack = () => router.push('/records/lab-tests')
  const handleCancel = () => router.push('/records/lab-tests')

  const handleCreate = async (): Promise<{ ok: boolean; message: string }> => {
    const nextErrors: typeof errors = {}
    if (!formData.testCode.trim()) nextErrors.testCode = 'Test Code is required'
    if (!formData.testName.trim()) nextErrors.testName = 'Test Name is required'
    if (!String(formData.sampleType).trim()) nextErrors.sampleType = 'Sample Type is required'
    if (nextErrors.testCode || nextErrors.testName || nextErrors.sampleType) {
      setErrors(nextErrors)
      return { ok: false, message: 'Validation failed' }
    }
    const hours = Number(formData.tat)
    const tat_minutes = Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : 0
    const sample_type = (formData.sampleType || '').toString().trim().toUpperCase()
    const payload = {
      test_name: formData.testName.trim(),
      test_code: formData.testCode.trim(),
      sample_type,
      tube_name: formData.tubeName.trim() || undefined,
      tat_minutes,
      fasting: Boolean(formData.fasting),
      active: Boolean(formData.active),
    }

    try {
      const res = await createTest(payload)
      if (res?.status === 200 || res?.status === 201) {
        setShowSuccess(true)
        return { ok: true, message: 'Lab test created successfully' }
      }
      setShowSuccess(true)
      return { ok: true, message: 'Lab test created successfully' }
    } catch (e: any) {
      console.error(e)
      return { ok: false, message: e?.message || 'Failed to create lab test' }
    }
  }

  const handleUpdate = async (): Promise<{ ok: boolean; message: string }> => {
    if (!guid) return
    const nextErrors: typeof errors = {}
    if (!formData.testCode.trim()) nextErrors.testCode = 'Test Code is required'
    if (!formData.testName.trim()) nextErrors.testName = 'Test Name is required'
    if (!String(formData.sampleType).trim()) nextErrors.sampleType = 'Sample Type is required'
    if (nextErrors.testCode || nextErrors.testName || nextErrors.sampleType) {
      setErrors(nextErrors)
      return { ok: false, message: 'Validation failed' }
    }
    const hours = Number(formData.tat)
    const tat_minutes = Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : 0
    const sample_type = (formData.sampleType || '').toString().trim().toUpperCase()
    const payload = {
      test_name: formData.testName.trim(),
      test_code: formData.testCode.trim(),
      sample_type,
      tube_name: formData.tubeName.trim() || undefined,
      tat_minutes,
      fasting: Boolean(formData.fasting),
      active: Boolean(formData.active),
    }

    try {
      const res = await updateTestByGuid(guid, payload)
      if (res) {
        setShowSuccess(true)
        return { ok: true, message: 'Lab test updated successfully' }
      }
      return { ok: false, message: 'Update failed' }
    } catch (e: any) {
      console.error(e)
      return { ok: false, message: e?.message || 'Failed to update lab test' }
    }
  }

  useEffect(() => {
    let ignore = false
    if (!guid) return
      ; (async () => {
        try {
          setLoading(true)
          const res = await getTestByGuid(guid)
          if (ignore) return
          const t = res?.data
          if (t) {
            const hours = Math.ceil((t.tat_minutes ?? 0) / 60)
            const displaySample = (t.sample_type || '').toString().toLowerCase()
            const formattedSample = displaySample ? displaySample.charAt(0).toUpperCase() + displaySample.slice(1) : ''
            const next: LabTestFormData = {
              testCode: t.test_code || '',
              testName: t.test_name || '',
              sampleType: formattedSample,
              tubeName: (t.tube_info && t.tube_info.length > 0 ? t.tube_info[0]?.tube_name || '' : t.tube_name || ''),
              tat: String(hours || ''),
              fasting: Boolean(t.fasting),
              active: true,
            }
            setFormData(next)
            setOriginal(next)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      })()
    return () => { ignore = true }
  }, [guid])

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    showDropdown,
    setShowDropdown,
    showSuccess,
    setShowSuccess,
    dropdownRef,
    handleSelect,
    handleChange,
    handleBack,
    handleCancel,
    handleCreate,
    handleUpdate,
    isEditMode,
    loading,
  }
}
