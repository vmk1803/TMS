"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhysicianCreatePayload } from '../../../../types/physicians'
import { getAllPartners } from '../../../orders/createNeworder/services/ordersService'
import { getStateByZipCode } from '../../users/services/createUserService'
import { getPhysicianByGuid, savePhysician, updatePhysician } from '../services/physiciansService'
import { AddPhysicianFormData } from '../../../../types/physicians'

export function useAddPhysicianForm(guid?: string | null) {
  const router = useRouter()

  const [formData, setFormData] = useState<AddPhysicianFormData>({
    npiNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone_number: '',
    email: '',
    fax: '',
    address1: '',
    address2: '',
    city: '',
    zip: '',
    state: '',
    country: '',
    specialization: '',
    faxEnabled: false,
    emailNotification: false,
    orderingFacilities: [],
    partnerGuids: [],
  })

  const [initialPayload, setInitialPayload] = useState<PhysicianCreatePayload | null>(null)

  const [partners, setPartners] = useState<any[]>([])
  const [loadingPartners, setLoadingPartners] = useState(false)
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const [zipLoading, setZipLoading] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)
  const [lastZipFetched, setLastZipFetched] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const isEdit = !!guid

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('')
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({
    orderingFacility: null,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInsideAny = Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(e.target as Node)
      )
      if (!clickedInsideAny) setDropdownOpen(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoadingPartners(true)
        const list = await getAllPartners()
        setPartners(Array.isArray(list) ? list : [])
      } catch (e) {
        setPartners([])
      } finally {
        setLoadingPartners(false)
      }
    }
    loadPartners()
  }, [])

  useEffect(() => {
    let active = true
    const loadExisting = async () => {
      if (!guid) return
      try {
        setSaving(true)
        const d = await getPhysicianByGuid(guid)
        if (!active || !d) return
        const nextForm: AddPhysicianFormData = {
          npiNumber: d.npi || '',
          firstName: d.first_name || '',
          middleName: d.middle_name || '',
          lastName: d.last_name || '',
          phone_number: d.phone_number || '',
          email: d.email || '',
          fax: d.fax || '',
          address1: d.address_line1 || '',
          address2: d.address_line2 || '',
          city: d.city || '',
          zip: d.zipcode || '',
          state: d.state || '',
          country: d.country || '',
          specialization: d.specialization || '',
          faxEnabled: !!d.fax_notification,
          emailNotification: !!d.email_notification,
          orderingFacilities: Array.isArray(d.partners)
            ? d.partners.map((p: any) => p.name).filter(Boolean)
            : [],
          partnerGuids: Array.isArray(d.partners)
            ? d.partners
                .map((p: any) => p.guid || p.partner_guid || p.id)
                .filter((x: any) => !!x)
            : [],
        }
        setFormData(nextForm)

        const basePayload: PhysicianCreatePayload = {
          npi: nextForm.npiNumber,
          partner_guid: nextForm.partnerGuids,
          first_name: nextForm.firstName,
          middle_name: nextForm.middleName || null,
          last_name: nextForm.lastName,
          email: nextForm.email || null,
          fax: nextForm.fax || null,
          address_line1: nextForm.address1,
          address_line2: nextForm.address2 || null,
          zipcode: nextForm.zip,
          city: nextForm.city,
          state: nextForm.state,
          country: nextForm.country,
          specialization: nextForm.specialization || null,
          ordering_facility_fax: !!nextForm.faxEnabled,
          email_notification: !!nextForm.emailNotification,
        }
        setInitialPayload(basePayload)
      } catch (e: any) {
        if (!active) return
        setErrors((prev) => ({ ...prev, submit: e?.message || 'Failed to load physician details' }))
      } finally {
        if (active) setSaving(false)
      }
    }
    loadExisting()
    return () => {
      active = false
    }
    }, [guid])

    // ZIP lookup effect — mirror Technician behaviour
    useEffect(() => {
      const zip = (formData.zip || '').trim()
      if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastZipFetched) {
        setZipLoading(true)
        setZipError(null)
        setLastZipFetched(zip)
        getStateByZipCode(zip)
          .then(res => {
            const apiCity = res?.city || res?.data?.city || res?.data?.City || ''
            const stateVal = res?.state || res?.data?.state || res?.data?.State || res?.state_name || res?.data?.state_name || ''
            let citiesArr: string[] = res?.cities || res?.data?.cities || []

            if (apiCity && !citiesArr.includes(apiCity)) {
              citiesArr = [apiCity, ...citiesArr]
            }

            setCityOptions(citiesArr)

            setFormData(prev => {
              const updates: any = {}
              if (stateVal) updates.state = stateVal

              if (apiCity) updates.city = apiCity
              else if (citiesArr.length === 1) updates.city = citiesArr[0]
              else if (citiesArr.length > 0 && prev.city && !citiesArr.includes(prev.city)) updates.city = ''

              return Object.keys(updates).length ? { ...prev, ...updates } : prev
            })
          })
          .catch(e => {
            setZipError(e?.message || 'Zip lookup failed')
            setCityOptions([])
          })
          .finally(() => setZipLoading(false))
      } else if (zip.length !== 5) {
        setCityOptions([])
        setZipError(null)
        if (lastZipFetched && zip.length < 5) setLastZipFetched('')
      }
    }, [formData.zip, lastZipFetched, formData.city])

  const handleSelect = (field: keyof AddPhysicianFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setDropdownOpen(null)
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleChange = (key: keyof AddPhysicianFormData, value: any) => {
    // sanitize zip input to digits only and max length 5 (same as Technician)
    if (key === 'zip') {
      value = String(value).replace(/\D/g, '').slice(0, 5)
      if ((value || '').length < 5) {
        setCityOptions([])
        setZipError(null)
        if (lastZipFetched) setLastZipFetched('')
      }
    }

    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleBack = () => router.push('/records/physicians')
  const handleCancel = () => router.push('/records/physicians')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.npiNumber?.trim()) e.npiNumber = 'NPI Number is required'
    if (!formData.firstName?.trim()) e.firstName = 'First Name is required'
    if (!formData.lastName?.trim()) e.lastName = 'Last Name is required'
    if (!formData.address1?.trim()) e.address1 = 'Address Line 1 is required'
    if (!formData.city?.trim()) e.city = 'City is required'
    if (!formData.state?.trim()) e.state = 'State is required'
    if (!formData.zip?.trim()) e.zip = 'Zip Code is required'
    if (!formData.country?.trim()) e.country = 'Country is required'
    if (!formData.specialization?.trim()) e.specialization = 'Specialization is required'
    if (!Array.isArray(formData.partnerGuids) || formData.partnerGuids.length === 0) e.partnerGuids = 'Ordering Facility is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return
    const payload: PhysicianCreatePayload = {
      npi: formData.npiNumber,
      partner_guid: formData.partnerGuids,
      first_name: formData.firstName,
      middle_name: formData.middleName || '',
      last_name: formData.lastName,
      email: formData.email || null,
      fax: formData.fax || null,
      address_line1: formData.address1,
      address_line2: formData.address2 || null,
      zipcode: formData.zip,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      specialization: formData.specialization || null,
      ordering_facility_fax: !!formData.faxEnabled,
      email_notification: !!formData.emailNotification,
      phone_number: formData.phone_number,
    }

    try {
      setSaving(true)
      await savePhysician(payload)
      setShowSuccess(true)
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, submit: e?.message || 'Failed to create physician' }))
      // Re-throw the error so it can be caught by the component for toast display
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!guid) return
    if (!validate()) return

    const currentPayload: PhysicianCreatePayload = {
      npi: formData.npiNumber,
      partner_guid: formData.partnerGuids,
      first_name: formData.firstName,
      middle_name: formData.middleName || '',
      last_name: formData.lastName,
      email: formData.email || null,
      fax: formData.fax || null,
      address_line1: formData.address1,
      address_line2: formData.address2 || null,
      zipcode: formData.zip,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      specialization: formData.specialization || null,
      ordering_facility_fax: !!formData.faxEnabled,
      email_notification: !!formData.emailNotification,
      phone_number: formData.phone_number,
    }

    let diff: Partial<PhysicianCreatePayload> = currentPayload
    if (initialPayload) {
      const next: Partial<PhysicianCreatePayload> = {}
      ;(
        [
          'npi',
          'partner_guid',
          'first_name',
          'middle_name',
          'last_name',
          'email',
          'fax',
          'address_line1',
          'address_line2',
          'zipcode',
          'city',
          'state',
          'country',
          'specialization',
          'ordering_facility_fax',
          'email_notification',
          'phone_number'
        ] as (keyof PhysicianCreatePayload)[]
      ).forEach((k) => {
        const before = initialPayload[k]
        const after = currentPayload[k]
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          ;(next as any)[k] = after
        }
      })
      diff = next
    }

    try {
      setSaving(true)
      if (Object.keys(diff).length > 0) {
        await updatePhysician(guid, diff)
      }
      setShowSuccess(true)
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, submit: e?.message || 'Failed to update physician' }))
      // Re-throw the error so it can be caught by the component for toast display
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    router.push('/records/physicians')
  }

  // Filter partners based on search term
  const filteredPartners = partners.filter((partner: any) => {
    const name = partner.name || ''
    return name.toLowerCase().includes(facilitySearchTerm.toLowerCase())
  })

  // Remove facility function
  const removeFacility = (guidToRemove: string, nameToRemove: string) => {
    const nextGuids = (formData.partnerGuids || []).filter(g => g !== guidToRemove)
    const nextNames = (formData.orderingFacilities || []).filter(n => n !== nameToRemove)
    
    handleChange('partnerGuids', nextGuids)
    handleChange('orderingFacilities', nextNames)
  }

  // Clear search when dropdown closes
  const handleDropdownToggle = (dropdown: string) => {
    if (dropdownOpen === dropdown) {
      setDropdownOpen(null)
      setFacilitySearchTerm('')
    } else {
      setDropdownOpen(dropdown)
    }
  }

  return {
    formData,
    setFormData,
    partners,
    filteredPartners,
    loadingPartners,
    cityOptions,
    zipLoading,
    zipError,
    saving,
    errors,
    setErrors,
    showSuccess,
    setShowSuccess,
    isEdit,
    dropdownOpen,
    setDropdownOpen,
    facilitySearchTerm,
    setFacilitySearchTerm,
    dropdownRefs,
    handleSelect,
    handleChange,
    handleBack,
    handleCancel,
    handleCreate,
    handleUpdate,
    handleCloseSuccess,
    removeFacility,
    handleDropdownToggle,
  }
}
