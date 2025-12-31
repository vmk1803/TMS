"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StorageTemperatureEnum, NewTestTubeForm } from '../../../../types/testTubes'
import { buildSaveTestTubeFormData, buildUpdateTestTubeFormData } from './testTubeFormData'
import { saveTestTube, getTubeByGuid, updateTubeByGuid } from '../services/testTubesService'

export function useNewTestTubeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tubeGuid = searchParams.get('tube_guid') || ''
  const mode = (searchParams.get('mode') as 'edit' | 'create' | null) || 'create'
  const isEdit = mode === 'edit' && !!tubeGuid
  const [form, setForm] = useState<NewTestTubeForm>({
    tubeName: '',
    specialInstructions: '',
    quantity: '',
    storageTemperature: '',
    imageFile: null,
  })
  const [originalForm, setOriginalForm] = useState<NewTestTubeForm | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ tubeName?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return
      try {
        setSubmitting(true)
        const res = await getTubeByGuid(tubeGuid)
        const data = res?.data
        if (!data) return
        const rawQty = data.quantity != null ? String(data.quantity) : ''
        const cleanedQty = rawQty.replace(/\s*mL$/i, '')
        const next: NewTestTubeForm = {
          tubeName: data.tube_name || '',
          specialInstructions: data.special_instructions || '',
          quantity: cleanedQty,
          storageTemperature: (data.storage_temperature as any) || '',
          imageFile: null,
        }
        setForm(next)
        setOriginalForm(next)
        setExistingImageUrl(data.image_url || null)
      } catch (e: any) {
        setFailure(e?.message || 'Failed to load test tube')
      } finally {
        setSubmitting(false)
      }
    }
    load()
  }, [isEdit, tubeGuid])

  const handleChange = <K extends keyof NewTestTubeForm>(key: K, value: NewTestTubeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'tubeName' && typeof value === 'string' && value.trim()) {
      setErrors((e) => ({ ...e, tubeName: '' }))
    }
  }

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {}
    if (!form.tubeName.trim()) nextErrors.tubeName = 'Tube Name is required'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setSubmitting(true)
    setFailure(null)
    try {
      if (isEdit && tubeGuid && originalForm) {
        const fd = buildUpdateTestTubeFormData(form, originalForm)
        const res = await updateTubeByGuid(tubeGuid, fd)
        if (res?.status === 200) {
          setShowSuccess(true)
        } else {
          setFailure(res?.message || 'Failed to update test tube')
        }
      } else {
        const fd = buildSaveTestTubeFormData(form)
        const res = await saveTestTube(fd)
        if (res?.status === 200 || res?.status === 201) {
          setShowSuccess(true)
        } else {
          setFailure(res?.message || 'Failed to save test tube')
        }
      }
    } catch (e: any) {
      setFailure(e?.message || (isEdit ? 'Failed to update test tube' : 'Failed to save test tube'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    router.push('/records/testtubes')
  }

  return {
    form,
    errors,
    submitting,
    showSuccess,
    failure,
    isEdit,
    existingImageUrl,
    StorageTemperatureEnum,
    handleChange,
    handleSubmit,
    handleCloseSuccess,
    tubeGuid,
  }
}
