'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Loader2, ChevronDown, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateField } from '../../../../store/ordersSlice';
import { INSURANCE_RELATION_OPTIONS, GENDER_OPTIONS } from '../../../../lib/orderEnums'
import { useOrderForm } from '../hooks/useOrderForm'
import { getAllInsurances, getStateByZip } from '../services/ordersService'
import CustomSelect from '../../../../components/common/CustomSelect'
import DateOfBirthPicker from '../../../../components/common/DateOfBirthPicker'

const InsuranceInformation: React.FC<{ submitAttempted?: boolean }> = ({ submitAttempted = false }) => {
  const dispatch = useAppDispatch()
  const insurance = useAppSelector((s: any) => s.orders.insurance || {})
  const orderInfo = useAppSelector((s: any) => s.orders.orderInfo || {})
  const personal = useAppSelector((s: any) => s.orders.personal || {})
  const { validateSection } = useOrderForm()

  // Helper: Title Case each word
  const toTitleCase = (s: string) => {
    return String(s)
      .toLowerCase()
      .split(/\s+/)
      .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : '')
      .join(' ')
  }

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const [primaryInsuranceOptions, setPrimaryInsuranceOptions] = useState<any[]>([])
  const [secondaryInsuranceOptions, setSecondaryInsuranceOptions] = useState<any[]>([])
  const [primaryLoading, setPrimaryLoading] = useState<boolean>(false)
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // State for insurance name search and dropdown visibility
  const [primaryInsuranceSearch, setPrimaryInsuranceSearch] = useState<string>('')
  const [secondaryInsuranceSearch, setSecondaryInsuranceSearch] = useState<string>('')
  const [showPrimaryInsuranceDropdown, setShowPrimaryInsuranceDropdown] = useState<boolean>(false)
  const [showSecondaryInsuranceDropdown, setShowSecondaryInsuranceDropdown] = useState<boolean>(false)

  // State for secondary insurance toggle
  const [showSecondaryInsurance, setShowSecondaryInsurance] = useState<boolean>(false)

  // State for relationship search
  const [relationshipSearch, setRelationshipSearch] = useState<string>('')
  const [secondaryRelationshipSearch, setSecondaryRelationshipSearch] = useState<string>('')
  const [showPrimaryRelationshipDropdown, setShowPrimaryRelationshipDropdown] = useState<boolean>(false)
  const [showSecondaryRelationshipDropdown, setShowSecondaryRelationshipDropdown] = useState<boolean>(false)

  // ZIP Code State for Primary Insurance
  const [primaryCityOptions, setPrimaryCityOptions] = useState<string[]>([])
  const [primaryZipLoading, setPrimaryZipLoading] = useState(false)
  const [primaryZipError, setPrimaryZipError] = useState<string | null>(null)
  const [lastPrimaryZipFetched, setLastPrimaryZipFetched] = useState('')

  // ZIP Code State for Secondary Insurance
  const [secondaryCityOptions, setSecondaryCityOptions] = useState<string[]>([])
  const [secondaryZipLoading, setSecondaryZipLoading] = useState(false)
  const [secondaryZipError, setSecondaryZipError] = useState<string | null>(null)
  const [lastSecondaryZipFetched, setLastSecondaryZipFetched] = useState('')

  // Refs for insurance dropdowns
  const primaryInsuranceRef = useRef<HTMLDivElement>(null)
  const secondaryInsuranceRef = useRef<HTMLDivElement>(null)
  const primaryRelationshipRef = useRef<HTMLDivElement>(null)
  const secondaryRelationshipRef = useRef<HTMLDivElement>(null)

  // Handle generic field changes (maps to insurance slice)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    // Sanitize and normalize name fields for insurance patients
    let newValue: any = value

    const toTitleCase = (s: string) => {
      return s
        .toLowerCase()
        .split(/\s+/)
        .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : '')
        .join(' ')
    }

    if (['primaryPatientFirstName', 'primaryPatientMiddleName', 'primaryPatientLastName', 'secondaryPatientFirstName', 'secondaryPatientMiddleName', 'secondaryPatientLastName'].includes(target.name)) {
      newValue = String(value).replace(/[^a-zA-Z\s'-]/g, '')
      newValue = toTitleCase(newValue)
    }

    setTouched((prev) => ({ ...prev, [target.name]: true }))
    dispatch(updateField({ section: 'insurance', field: target.name, value: newValue }))
  }

  // Billing type change (updates orderInfo slice)
  const handleBillingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setTouched((prev) => ({ ...prev, billingType: true }))
    dispatch(updateField({ section: 'orderInfo', field: 'billingType', value }))
  }

  // Handle primary insurance selection from dropdown
  const handlePrimaryInsuranceSelect = (selectedGuid: string, name: string, code: string) => {
    setTouched((prev) => ({ ...prev, primaryInsuranceGuid: true }))
    dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceGuid', value: selectedGuid }))
    dispatch(updateField({ section: 'insurance', field: 'carrierCode', value: code }))
    dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceName', value: name }))
    setPrimaryInsuranceSearch(name)
    setShowPrimaryInsuranceDropdown(false)
  }

  // Handle secondary insurance selection from dropdown
  const handleSecondaryInsuranceSelect = (selectedGuid: string, name: string, code: string) => {
    setTouched((prev) => ({ ...prev, secondaryInsuranceGuid: true }))
    dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceGuid', value: selectedGuid }))
    dispatch(updateField({ section: 'insurance', field: 'secondaryCarrierCode', value: code }))
    dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceName', value: name }))
    setSecondaryInsuranceSearch(name)
    setShowSecondaryInsuranceDropdown(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (primaryInsuranceRef.current && !primaryInsuranceRef.current.contains(event.target as Node)) {
        setShowPrimaryInsuranceDropdown(false)
      }
      if (secondaryInsuranceRef.current && !secondaryInsuranceRef.current.contains(event.target as Node)) {
        setShowSecondaryInsuranceDropdown(false)
      }
      if (primaryRelationshipRef.current && !primaryRelationshipRef.current.contains(event.target as Node)) {
        setShowPrimaryRelationshipDropdown(false)
      }
      if (secondaryRelationshipRef.current && !secondaryRelationshipRef.current.contains(event.target as Node)) {
        setShowSecondaryRelationshipDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Validation effect – re‑validate whenever insurance fields or billing type change
  useEffect(() => {
    const v = validateSection('insurance')
    setErrors(v)
  }, [insurance, orderInfo])

  // Clear insurance fields from payload when billing type is not INSURANCE
  useEffect(() => {
    if (orderInfo.billingType && orderInfo.billingType !== 'INSURANCE') {
      const fieldsToClear = [
        'primaryInsuranceGuid',
        'primaryInsuranceName',
        'carrierCode',
        'planType',
        'primaryPolicyNumber',
        'primaryGroupNumber',
        'primaryRelationship',
        // Primary patient detail fields
        'primaryPatientFirstName',
        'primaryPatientMiddleName',
        'primaryPatientLastName',
        'primaryPatientGender',
        'primaryPatientDob',
        'primaryPatientAddress1',
        'primaryPatientAddress2',
        'primaryPatientCity',
        'primaryPatientState',
        'primaryPatientZip',
        // Secondary insurance fields
        'secondaryInsuranceGuid',
        'secondaryInsuranceName',
        'secondaryCarrierCode',
        'secondaryPlanType',
        'secondaryPolicyNumber',
        'secondaryGroupNumber',
        'secondaryRelationship',
        // Secondary patient detail fields
        'secondaryPatientFirstName',
        'secondaryPatientMiddleName',
        'secondaryPatientLastName',
        'secondaryPatientGender',
        'secondaryPatientDob',
        'secondaryPatientAddress1',
        'secondaryPatientAddress2',
        'secondaryPatientCity',
        'secondaryPatientState',
        'secondaryPatientZip',
      ]
      fieldsToClear.forEach((field) => {
        dispatch(updateField({ section: 'insurance', field, value: '' }))
      })
      setShowSecondaryInsurance(false)
    }
  }, [orderInfo.billingType])

  // Fetch insurances for primary field when search term changes (debounced)
  useEffect(() => {
    let mounted = true
    const term = primaryInsuranceSearch && primaryInsuranceSearch.trim().length > 0 ? primaryInsuranceSearch.trim() : undefined
    const load = async () => {
      try {
        setPrimaryLoading(true)
        setLoadError(null)
        const list = await getAllInsurances(term, 1)
        if (mounted) setPrimaryInsuranceOptions(Array.isArray(list) ? list : [])
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'Failed to load insurances')
      } finally {
        if (mounted) setPrimaryLoading(false)
      }
    }
    const tid = setTimeout(load, 350)
    return () => {
      mounted = false
      clearTimeout(tid)
    }
  }, [primaryInsuranceSearch])

  // Fetch insurances for secondary field when search term changes (debounced)
  useEffect(() => {
    let mounted = true
    const term = secondaryInsuranceSearch && secondaryInsuranceSearch.trim().length > 0 ? secondaryInsuranceSearch.trim() : undefined
    const load = async () => {
      try {
        setSecondaryLoading(true)
        setLoadError(null)
        const list = await getAllInsurances(term, 1)
        if (mounted) setSecondaryInsuranceOptions(Array.isArray(list) ? list : [])
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'Failed to load insurances')
      } finally {
        if (mounted) setSecondaryLoading(false)
      }
    }
    const tid = setTimeout(load, 350)
    return () => {
      mounted = false
      clearTimeout(tid)
    }
  }, [secondaryInsuranceSearch])

  // Automatically show secondary insurance section if secondary insurance data exists
  useEffect(() => {
    if (insurance.secondaryInsuranceGuid && insurance.secondaryInsuranceGuid.trim() !== '') {
      setShowSecondaryInsurance(true)
    }
  }, [insurance.secondaryInsuranceGuid])

  // Sync insurance search with selected values
  useEffect(() => {
    if (insurance.primaryInsuranceName && primaryInsuranceSearch !== insurance.primaryInsuranceName) {
      setPrimaryInsuranceSearch(insurance.primaryInsuranceName)
    }
  }, [insurance.primaryInsuranceName])

  useEffect(() => {
    if (insurance.secondaryInsuranceName && secondaryInsuranceSearch !== insurance.secondaryInsuranceName) {
      setSecondaryInsuranceSearch(insurance.secondaryInsuranceName)
    }
  }, [insurance.secondaryInsuranceName])

  // Sync relationship search with selected values
  useEffect(() => {
    if (insurance.primaryRelationship) {
      const found = INSURANCE_RELATION_OPTIONS.find((opt) => opt.value === insurance.primaryRelationship)
      if (found && relationshipSearch !== found.label) {
        setRelationshipSearch(found.label)
      }
    }
  }, [insurance.primaryRelationship])

  useEffect(() => {
    if (insurance.secondaryRelationship) {
      const found = INSURANCE_RELATION_OPTIONS.find((opt) => opt.value === insurance.secondaryRelationship)
      if (found && secondaryRelationshipSearch !== found.label) {
        setSecondaryRelationshipSearch(found.label)
      }
    }
  }, [insurance.secondaryRelationship])

  const getFieldError = (fieldName: string) => {
    return (touched[fieldName] || submitAttempted) && errors[fieldName] ? errors[fieldName][0] : null
  }


  // Zip Code Lookup Effect for Primary Insurance
  useEffect(() => {
    const zip = (insurance.primaryPatientZip || '').trim()
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastPrimaryZipFetched) {
      setPrimaryZipLoading(true)
      setPrimaryZipError(null)
      setLastPrimaryZipFetched(zip)
      getStateByZip(zip)
        .then(res => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || ''
          const stateVal = res?.state || res?.data?.state || res?.data?.State || ''
          let citiesArr: string[] = res?.cities || res?.data?.cities || []

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr]
          }

          if (stateVal) {
            dispatch(updateField({ section: 'insurance', field: 'primaryPatientState', value: stateVal }))
          }

          setPrimaryCityOptions(citiesArr)

          if (apiCity) {
            dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: apiCity }))
          } else if (citiesArr.length === 1) {
            dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: citiesArr[0] }))
          } else if (citiesArr.length > 0 && insurance.primaryPatientCity && !citiesArr.includes(insurance.primaryPatientCity)) {
            dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: '' }))
          }
        })
        .catch(e => {
          setPrimaryZipError(e?.message || 'Zip lookup failed')
          setPrimaryCityOptions([])
        })
        .finally(() => {
          setPrimaryZipLoading(false)
        })
    } else if (zip.length !== 5) {
      setPrimaryCityOptions([])
      setPrimaryZipError(null)
      if (lastPrimaryZipFetched && zip.length < 5) setLastPrimaryZipFetched('')
    }
  }, [insurance.primaryPatientZip, lastPrimaryZipFetched, insurance.primaryPatientCity, dispatch])

  // Zip Code Lookup Effect for Secondary Insurance
  useEffect(() => {
    const zip = (insurance.secondaryPatientZip || '').trim()
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastSecondaryZipFetched) {
      setSecondaryZipLoading(true)
      setSecondaryZipError(null)
      setLastSecondaryZipFetched(zip)
      getStateByZip(zip)
        .then(res => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || ''
          const stateVal = res?.state || res?.data?.state || res?.data?.State || ''
          let citiesArr: string[] = res?.cities || res?.data?.cities || []

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr]
          }

          if (stateVal) {
            dispatch(updateField({ section: 'insurance', field: 'secondaryPatientState', value: stateVal }))
          }

          setSecondaryCityOptions(citiesArr)

          if (apiCity) {
            dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: apiCity }))
          } else if (citiesArr.length === 1) {
            dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: citiesArr[0] }))
          } else if (citiesArr.length > 0 && insurance.secondaryPatientCity && !citiesArr.includes(insurance.secondaryPatientCity)) {
            dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: '' }))
          }
        })
        .catch(e => {
          setSecondaryZipError(e?.message || 'Zip lookup failed')
          setSecondaryCityOptions([])
        })
        .finally(() => {
          setSecondaryZipLoading(false)
        })
    } else if (zip.length !== 5) {
      setSecondaryCityOptions([])
      setSecondaryZipError(null)
      if (lastSecondaryZipFetched && zip.length < 5) setLastSecondaryZipFetched('')
    }
  }, [insurance.secondaryPatientZip, lastSecondaryZipFetched, insurance.secondaryPatientCity, dispatch])

  // Filter insurance options based on search
  const filteredPrimaryInsurances =
    primaryInsuranceSearch.trim() === ""
      ? primaryInsuranceOptions
      : primaryInsuranceOptions.filter((opt) =>
        opt.name?.toLowerCase().includes(primaryInsuranceSearch.toLowerCase())
      )

  const filteredSecondaryInsurances =
    secondaryInsuranceSearch.trim() === ""
      ? secondaryInsuranceOptions
      : secondaryInsuranceOptions.filter((opt) =>
        opt.name?.toLowerCase().includes(secondaryInsuranceSearch.toLowerCase())
      )


  const filteredPrimaryRelationships =
    relationshipSearch.trim() === ""
      ? INSURANCE_RELATION_OPTIONS
      : INSURANCE_RELATION_OPTIONS.filter((opt) =>
        opt.label.toLowerCase().includes(relationshipSearch.toLowerCase())
      )

  const filteredSecondaryRelationships =
    secondaryRelationshipSearch.trim() === ""
      ? INSURANCE_RELATION_OPTIONS
      : INSURANCE_RELATION_OPTIONS.filter((opt) =>
        opt.label.toLowerCase().includes(secondaryRelationshipSearch.toLowerCase())
      )


  return (
    <div className="bg-white rounded-xl">
      <h2 className="text-[20px] font-semibold text-primaryText mb-6">Billing Information</h2>

      {/* Billing Type - Always visible */}
      <div className="mb-6">
        <div className="w-full md:w-1/3">
          <CustomSelect
            label="Billing Type"
            value={orderInfo.billingType ?? ''}
            options={[
              { label: 'Insurance', value: 'INSURANCE' },
              { label: 'Client', value: 'CLIENT' },
              { label: 'Patient', value: 'PATIENT' },
            ]}
            onChange={(val) => {
              setTouched((prev) => ({ ...prev, billingType: true }))
              dispatch(updateField({ section: 'orderInfo', field: 'billingType', value: val }))
            }}
            required
          />
        </div>
        {getFieldError('billingType') && (
          <p className="text-red-500 text-xs mt-1">{getFieldError('billingType')}</p>
        )}
      </div>

      {/* Primary Insurance Section - Conditionally rendered */}
      {orderInfo.billingType === 'INSURANCE' && (
        <>
          <h3 className="text-[18px] font-semibold text-primaryText mb-4">Primary Insurance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Primary Insurance Name */}
            <div ref={primaryInsuranceRef}>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Insurance Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="primaryInsuranceName"
                  value={primaryInsuranceSearch}
                  onChange={(e) => {
                    setPrimaryInsuranceSearch(e.target.value)
                    setShowPrimaryInsuranceDropdown(true)
                    if (!e.target.value) {
                      dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceGuid', value: '' }))
                      dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceName', value: '' }))
                      dispatch(updateField({ section: 'insurance', field: 'carrierCode', value: '' }))
                    }
                  }}
                  onFocus={() => setShowPrimaryInsuranceDropdown(true)}
                  placeholder="Search insurance name"
                  className={`w-full rounded-2xl border ${getFieldError('primaryInsuranceGuid') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 pr-16`}
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {primaryInsuranceSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryInsuranceSearch('')
                        dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceGuid', value: '' }))
                        dispatch(updateField({ section: 'insurance', field: 'primaryInsuranceName', value: '' }))
                        dispatch(updateField({ section: 'insurance', field: 'carrierCode', value: '' }))
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {primaryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                {showPrimaryInsuranceDropdown && filteredPrimaryInsurances.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-formBorder rounded-2xl shadow-lg max-h-60 overflow-y-auto scrollbar-custom">
                    {filteredPrimaryInsurances.map((opt) => (
                      <div
                        key={opt.guid || opt.id || opt.name}
                        onClick={() => handlePrimaryInsuranceSelect(opt.guid, opt.name, opt.insurance_code || '')}
                        className={`px-3 py-2 cursor-pointer hover:bg-green-50 text-sm text-primaryText ${insurance.primaryInsuranceGuid === opt.guid ? 'bg-green-100' : ''
                          }`}
                      >
                        {opt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {loadError && (
                <p className="text-red-500 text-xs mt-1">{loadError}</p>
              )}
              {getFieldError('primaryInsuranceGuid') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('primaryInsuranceGuid')}</p>
              )}
            </div>

            {/* Primary Carrier Code */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Carrier Code <span className="text-red-500">*</span>
              </label>
              <input
                name="carrierCode"
                type="text"
                placeholder="Enter Carrier Code"
                value={insurance.carrierCode ?? ''}
                onChange={handleChange}
                className={`w-full rounded-2xl border ${getFieldError('carrierCode') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
              {getFieldError('carrierCode') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('carrierCode')}</p>
              )}
            </div>

            {/* Primary Plan Type */}
            {/* <div>
              <CustomSelect
                label="Plan Type"
                value={insurance.planType ?? ''}
                options={[
                  { label: 'INDIVIDUAL', value: 'INDIVIDUAL' },
                  { label: 'FAMILY', value: 'FAMILY' },
                ]}
                onChange={(val) => {
                  setTouched((prev) => ({ ...prev, planType: true }))
                  dispatch(updateField({ section: 'insurance', field: 'planType', value: val }))
                }}
                required
              />
              {getFieldError('planType') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('planType')}</p>
              )}
            </div> */}

            {/* Primary Policy Number */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                name="primaryPolicyNumber"
                type="text"
                placeholder="Enter Policy Number"
                value={insurance.primaryPolicyNumber ?? ''}
                onChange={handleChange}
                className={`w-full rounded-2xl border ${getFieldError('primaryPolicyNumber') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
              {getFieldError('primaryPolicyNumber') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPolicyNumber')}</p>
              )}
            </div>

            {/* Primary Group Number */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">Group Number</label>
              <input
                name="primaryGroupNumber"
                type="text"
                placeholder="Enter Group Number"
                value={insurance.primaryGroupNumber ?? ''}
                onChange={handleChange}
                className={`w-full rounded-2xl border ${getFieldError('primaryGroupNumber') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
              {getFieldError('primaryGroupNumber') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('primaryGroupNumber')}</p>
              )}
            </div>

            {/* Primary Relationship */}
            <div>
              <div ref={primaryRelationshipRef}>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={relationshipSearch}
                    onChange={(e) => {
                      setRelationshipSearch(e.target.value)
                      setShowPrimaryRelationshipDropdown(true)
                    }}
                    onFocus={() => setShowPrimaryRelationshipDropdown(true)}
                    placeholder="Search relationship"
                    className={`w-full rounded-2xl border ${getFieldError('primaryRelationship') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm pr-16`}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {relationshipSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setRelationshipSearch('')
                          dispatch(updateField({ section: 'insurance', field: 'primaryRelationship', value: '' }))
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>

                  {showPrimaryRelationshipDropdown && (
                    <div className="absolute w-full max-h-40 overflow-y-auto scrollbar-custom mt-1 bg-white border border-formBorder rounded-xl shadow z-10">
                      {filteredPrimaryRelationships.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            if (opt.value === 'SELF') {
                              // Auto-bind personal details to insurance patient details
                              dispatch(updateField({ section: 'insurance', field: 'primaryRelationship', value: opt.value }))
                              setRelationshipSearch(opt.label)
                              setShowPrimaryRelationshipDropdown(false)

                              setShowPrimaryRelationshipDropdown(false)

                              // Bind personal info
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientFirstName', value: toTitleCase(personal.firstName || '') }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientMiddleName', value: toTitleCase(personal.middleName || '') }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientLastName', value: toTitleCase(personal.lastName || '') }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientGender', value: personal.gender || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientDob', value: personal.dob || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientAddress1', value: personal.address1 || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientAddress2', value: personal.address2 || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientZip', value: personal.zip || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: personal.city || '' }))
                              dispatch(updateField({ section: 'insurance', field: 'primaryPatientState', value: personal.state || '' }))
                            } else {
                              dispatch(updateField({ section: 'insurance', field: 'primaryRelationship', value: opt.value }))
                              setRelationshipSearch(opt.label)
                              setShowPrimaryRelationshipDropdown(false)
                            }
                          }}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm"
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {getFieldError('primaryRelationship') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryRelationship')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Primary Insurance Patient Details (Always visible, auto-filled if SELF) */}
          <div className="mb-6 pt-3 border-gray-100">
            {/* <h4 className="text-[16px] font-semibold text-primaryText mb-4">Patient Information</h4> */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="primaryPatientFirstName"
                  type="text"
                  placeholder="First Name"
                  value={insurance.primaryPatientFirstName ?? ''}
                  onChange={(e) => {
                    const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                    setTouched((prev) => ({ ...prev, primaryPatientFirstName: true }))
                    dispatch(updateField({ section: 'insurance', field: 'primaryPatientFirstName', value: sanitized }))
                  }}
                  className={`w-full rounded-2xl border ${getFieldError('primaryPatientFirstName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
                  autoComplete="off"
                />
                {getFieldError('primaryPatientFirstName') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientFirstName')}</p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Middle Name
                </label>
                <input
                  name="primaryPatientMiddleName"
                  type="text"
                  placeholder="Middle Name"
                  value={insurance.primaryPatientMiddleName ?? ''}
                  onChange={(e) => {
                    const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                    setTouched((prev) => ({ ...prev, primaryPatientMiddleName: true }))
                    dispatch(updateField({ section: 'insurance', field: 'primaryPatientMiddleName', value: sanitized }))
                  }}
                  className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="primaryPatientLastName"
                  type="text"
                  placeholder="Last Name"
                  value={insurance.primaryPatientLastName ?? ''}
                  onChange={(e) => {
                    const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                    setTouched((prev) => ({ ...prev, primaryPatientLastName: true }))
                    dispatch(updateField({ section: 'insurance', field: 'primaryPatientLastName', value: sanitized }))
                  }}
                  className={`w-full rounded-2xl border ${getFieldError('primaryPatientLastName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
                  autoComplete="off"
                />
                {getFieldError('primaryPatientLastName') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientLastName')}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <CustomSelect
                  label="Gender"
                  value={insurance.primaryPatientGender ?? ''}
                  options={GENDER_OPTIONS}
                  onChange={(val) => {
                    setTouched(prev => ({ ...prev, primaryPatientGender: true }))
                    dispatch(updateField({ section: 'insurance', field: 'primaryPatientGender', value: val }))
                  }}
                  required
                />
                {getFieldError('primaryPatientGender') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientGender')}</p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DateOfBirthPicker
                  name="primaryPatientDob"
                  value={insurance.primaryPatientDob ?? ''}
                  onChange={(date) => {
                    setTouched(prev => ({ ...prev, primaryPatientDob: true }))
                    dispatch(updateField({ section: 'insurance', field: 'primaryPatientDob', value: date || '' }))
                  }}
                  error={!!getFieldError('primaryPatientDob')}
                  placeholder="MM-DD-YYYY"
                />
                {getFieldError('primaryPatientDob') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientDob')}</p>
                )}
              </div>

              {/* Address 1 */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  name="primaryPatientAddress1"
                  type="text"
                  placeholder="Address Line 1"
                  value={insurance.primaryPatientAddress1 ?? ''}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border ${getFieldError('primaryPatientAddress1') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                  autoComplete="off"
                />
                {getFieldError('primaryPatientAddress1') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientAddress1')}</p>
                )}
              </div>

              {/* Address 2 */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Address Line 2
                </label>
                <input
                  name="primaryPatientAddress2"
                  type="text"
                  placeholder="Address Line 2"
                  value={insurance.primaryPatientAddress2 ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
                  autoComplete="off"
                />
              </div>

              {/* Zip */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  Zip <span className="text-red-500">*</span>
                </label>
                <input
                  name="primaryPatientZip"
                  type="text"
                  placeholder="Zip / Postal Code"
                  value={insurance.primaryPatientZip ?? ''}
                  onChange={handleChange}
                  maxLength={5}
                  className={`w-full rounded-2xl border ${getFieldError('primaryPatientZip') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                  autoComplete="off"
                />
                {getFieldError('primaryPatientZip') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientZip')}</p>
                )}
                {!getFieldError('primaryPatientZip') && primaryZipLoading && (
                  <p className="text-xs text-gray-500 mt-1">Looking up city & state…</p>
                )}
                {primaryZipError && (
                  <p className="text-xs text-red-500 mt-1">{primaryZipError}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm text-primaryText mb-2 font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  name="primaryPatientState"
                  type="text"
                  placeholder="State"
                  value={insurance.primaryPatientState ?? ''}
                  onChange={handleChange}
                  readOnly={primaryCityOptions.length > 0}
                  className={`w-full rounded-2xl border ${getFieldError('primaryPatientState') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 ${primaryCityOptions.length > 0 ? 'bg-gray-50' : ''}`}
                  autoComplete="off"
                />
                {getFieldError('primaryPatientState') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientState')}</p>
                )}
              </div>

              {/* City */}
              <div>
                {primaryCityOptions.length > 0 ? (
                  <div className="relative">
                    <CustomSelect
                      label="City"
                      value={insurance.primaryPatientCity ?? ''}
                      options={primaryCityOptions.map(c => ({ label: c, value: c }))}
                      onChange={(val) => {
                        setTouched(prev => ({ ...prev, primaryPatientCity: true }))
                        dispatch(updateField({ section: 'insurance', field: 'primaryPatientCity', value: val }))
                      }}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="primaryPatientCity"
                      type="text"
                      placeholder="City"
                      value={insurance.primaryPatientCity ?? ''}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border ${getFieldError('primaryPatientCity') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                      autoComplete="off"
                    />
                  </>
                )}
                {getFieldError('primaryPatientCity') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('primaryPatientCity')}</p>
                )}
              </div>

            </div>
          </div>

          {/* Secondary Insurance Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                if (showSecondaryInsurance) {
                  // Clear secondary insurance fields
                  dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceGuid', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceName', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryCarrierCode', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPlanType', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPolicyNumber', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryGroupNumber', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryRelationship', value: '' }))

                  // Clear secondary patient detail fields
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientFirstName', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientMiddleName', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientLastName', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientGender', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientDob', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress1', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress2', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientState', value: '' }))
                  dispatch(updateField({ section: 'insurance', field: 'secondaryPatientZip', value: '' }))

                  // Clear search states
                  setSecondaryInsuranceSearch('')
                  setSecondaryRelationshipSearch('')
                }
                setShowSecondaryInsurance(!showSecondaryInsurance)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showSecondaryInsurance ? 'Remove Secondary Insurance' : 'Add Secondary Insurance'}
            </button>
          </div>

          {/* Secondary Insurance Section */}
          {showSecondaryInsurance && (
            <>
              <h3 className="text-[18px] font-semibold text-primaryText mb-4">Secondary Insurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Secondary Insurance Name */}
                <div ref={secondaryInsuranceRef}>
                  <label className="block text-sm text-primaryText mb-2 font-medium">
                    Insurance Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="secondaryInsuranceName"
                      value={secondaryInsuranceSearch}
                      onChange={(e) => {
                        setSecondaryInsuranceSearch(e.target.value)
                        setShowSecondaryInsuranceDropdown(true)
                        if (!e.target.value) {
                          dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceGuid', value: '' }))
                          dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceName', value: '' }))
                          dispatch(updateField({ section: 'insurance', field: 'secondaryCarrierCode', value: '' }))
                        }
                      }}
                      onFocus={() => setShowSecondaryInsuranceDropdown(true)}
                      placeholder="Search insurance name"
                      className={`w-full rounded-2xl border ${getFieldError('secondaryInsuranceGuid') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 pr-16`}
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {secondaryInsuranceSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setSecondaryInsuranceSearch('')
                            dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceGuid', value: '' }))
                            dispatch(updateField({ section: 'insurance', field: 'secondaryInsuranceName', value: '' }))
                            dispatch(updateField({ section: 'insurance', field: 'secondaryCarrierCode', value: '' }))
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {secondaryLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    {showSecondaryInsuranceDropdown && filteredSecondaryInsurances.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-formBorder rounded-2xl shadow-lg max-h-60 overflow-y-auto scrollbar-custom">
                        {filteredSecondaryInsurances.map((opt) => (
                          <div
                            key={opt.guid || opt.id || opt.name}
                            onClick={() => handleSecondaryInsuranceSelect(opt.guid, opt.name, opt.insurance_code || '')}
                            className={`px-3 py-2 cursor-pointer hover:bg-green-50 text-sm text-primaryText ${insurance.secondaryInsuranceGuid === opt.guid ? 'bg-green-100' : ''
                              }`}
                          >
                            {opt.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {getFieldError('secondaryInsuranceGuid') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryInsuranceGuid')}</p>
                  )}
                </div>

                {/* Secondary Carrier Code */}
                <div>
                  <label className="block text-sm text-primaryText mb-2 font-medium">
                    Carrier Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="secondaryCarrierCode"
                    type="text"
                    placeholder="Enter Carrier Code"
                    value={insurance.secondaryCarrierCode ?? ''}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border ${getFieldError('secondaryCarrierCode') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                    autoComplete="off"
                  />
                  {getFieldError('secondaryCarrierCode') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryCarrierCode')}</p>
                  )}
                </div>

                {/* Secondary Plan Type */}
                {/* <div>
                  <CustomSelect
                    label="Plan Type"
                    value={insurance.secondaryPlanType ?? ''}
                    options={[
                      { label: 'INDIVIDUAL', value: 'INDIVIDUAL' },
                      { label: 'FAMILY', value: 'FAMILY' },
                    ]}
                    onChange={(val) => {
                      setTouched((prev) => ({ ...prev, secondaryPlanType: true }))
                      dispatch(updateField({ section: 'insurance', field: 'secondaryPlanType', value: val }))
                    }}
                    required
                  />
                  {getFieldError('secondaryPlanType') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPlanType')}</p>
                  )}
                </div> */}

                {/* Secondary Policy Number */}
                <div>
                  <label className="block text-sm text-primaryText mb-2 font-medium">
                    Policy Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="secondaryPolicyNumber"
                    type="text"
                    placeholder="Enter Policy Number"
                    value={insurance.secondaryPolicyNumber ?? ''}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border ${getFieldError('secondaryPolicyNumber') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                    autoComplete="off"
                  />
                  {getFieldError('secondaryPolicyNumber') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPolicyNumber')}</p>
                  )}
                </div>

                {/* Secondary Group Number */}
                <div>
                  <label className="block text-sm text-primaryText mb-2 font-medium">Group Number</label>
                  <input
                    name="secondaryGroupNumber"
                    type="text"
                    placeholder="Enter Group Number"
                    value={insurance.secondaryGroupNumber ?? ''}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border ${getFieldError('secondaryGroupNumber') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                    autoComplete="off"
                  />
                  {getFieldError('secondaryGroupNumber') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryGroupNumber')}</p>
                  )}
                </div>

                {/* Secondary Relationship */}
                <div ref={secondaryRelationshipRef}>
                  <label className="block text-sm text-primaryText mb-2 font-medium">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={secondaryRelationshipSearch}
                      onChange={(e) => {
                        setSecondaryRelationshipSearch(e.target.value)
                        setShowSecondaryRelationshipDropdown(true)
                      }}
                      onFocus={() => setShowSecondaryRelationshipDropdown(true)}
                      placeholder="Search relationship"
                      className={`w-full rounded-2xl border ${getFieldError('secondaryRelationship') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm pr-16`}
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {secondaryRelationshipSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setSecondaryRelationshipSearch('')
                            dispatch(updateField({ section: 'insurance', field: 'secondaryRelationship', value: '' }))
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>



                    {showSecondaryRelationshipDropdown && (
                      <div className="absolute w-full max-h-40 overflow-y-auto scrollbar-custom mt-1 bg-white border border-formBorder rounded-xl shadow z-10">
                        {filteredSecondaryRelationships.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => {
                              if (opt.value === 'SELF') {
                                // Auto-bind for secondary
                                dispatch(updateField({ section: 'insurance', field: 'secondaryRelationship', value: opt.value }))
                                setSecondaryRelationshipSearch(opt.label)
                                setShowSecondaryRelationshipDropdown(false)

                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientFirstName', value: toTitleCase(personal.firstName || '') }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientMiddleName', value: toTitleCase(personal.middleName || '') }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientLastName', value: toTitleCase(personal.lastName || '') }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientGender', value: personal.gender || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientDob', value: personal.dob || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress1', value: personal.address1 || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientAddress2', value: personal.address2 || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientZip', value: personal.zip || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: personal.city || '' }))
                                dispatch(updateField({ section: 'insurance', field: 'secondaryPatientState', value: personal.state || '' }))
                              } else {
                                dispatch(updateField({ section: 'insurance', field: 'secondaryRelationship', value: opt.value }))
                                setSecondaryRelationshipSearch(opt.label)
                                setShowSecondaryRelationshipDropdown(false)
                              }
                            }}
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm"
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Secondary Insurance Patient Details */}
              <div className="mb-6 pt-3 border-gray-100">
                {/* <h4 className="text-[16px] font-semibold text-primaryText mb-4">Subscriber Information (Secondary)</h4> */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="secondaryPatientFirstName"
                      type="text"
                      placeholder="First Name"
                      value={insurance.secondaryPatientFirstName ?? ''}
                      onChange={(e) => {
                        const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                        setTouched((prev) => ({ ...prev, secondaryPatientFirstName: true }))
                        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientFirstName', value: sanitized }))
                      }}
                      className={`w-full rounded-2xl border ${getFieldError('secondaryPatientFirstName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
                      autoComplete="off"
                    />
                    {getFieldError('secondaryPatientFirstName') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientFirstName')}</p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Middle Name
                    </label>
                    <input
                      name="secondaryPatientMiddleName"
                      type="text"
                      placeholder="Middle Name"
                      value={insurance.secondaryPatientMiddleName ?? ''}
                      onChange={(e) => {
                        const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                        setTouched((prev) => ({ ...prev, secondaryPatientMiddleName: true }))
                        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientMiddleName', value: sanitized }))
                      }}
                      className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500"
                      autoComplete="off"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="secondaryPatientLastName"
                      type="text"
                      placeholder="Last Name"
                      value={insurance.secondaryPatientLastName ?? ''}
                      onChange={(e) => {
                        const sanitized = String(e.target.value).replace(/[^a-zA-Z\s]/g, '')
                        setTouched((prev) => ({ ...prev, secondaryPatientLastName: true }))
                        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientLastName', value: sanitized }))
                      }}
                      className={`w-full rounded-2xl border ${getFieldError('secondaryPatientLastName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
                      autoComplete="off"
                    />
                    {getFieldError('secondaryPatientLastName') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientLastName')}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <CustomSelect
                      label="Gender"
                      value={insurance.secondaryPatientGender ?? ''}
                      options={GENDER_OPTIONS}
                      onChange={(val) => {
                        setTouched(prev => ({ ...prev, secondaryPatientGender: true }))
                        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientGender', value: val }))
                      }}
                      required
                    />
                    {getFieldError('secondaryPatientGender') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientGender')}</p>
                    )}
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <DateOfBirthPicker
                      name="secondaryPatientDob"
                      value={insurance.secondaryPatientDob ?? ''}
                      onChange={(date) => {
                        setTouched(prev => ({ ...prev, secondaryPatientDob: true }))
                        dispatch(updateField({ section: 'insurance', field: 'secondaryPatientDob', value: date || '' }))
                      }}
                      error={!!getFieldError('secondaryPatientDob')}
                      placeholder="MM-DD-YYYY"
                    />
                    {getFieldError('secondaryPatientDob') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientDob')}</p>
                    )}
                  </div>

                  {/* Address 1 */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="secondaryPatientAddress1"
                      type="text"
                      placeholder="Address Line 1"
                      value={insurance.secondaryPatientAddress1 ?? ''}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border ${getFieldError('secondaryPatientAddress1') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                      autoComplete="off"
                    />
                    {getFieldError('secondaryPatientAddress1') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientAddress1')}</p>
                    )}
                  </div>

                  {/* Address 2 */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Address Line 2
                    </label>
                    <input
                      name="secondaryPatientAddress2"
                      type="text"
                      placeholder="Address Line 2"
                      value={insurance.secondaryPatientAddress2 ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
                      autoComplete="off"
                    />
                  </div>

                  {/* Zip */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Zip <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="secondaryPatientZip"
                      type="text"
                      placeholder="Zip / Postal Code"
                      value={insurance.secondaryPatientZip ?? ''}
                      onChange={handleChange}
                      maxLength={5}
                      className={`w-full rounded-2xl border ${getFieldError('secondaryPatientZip') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                      autoComplete="off"
                    />
                    {getFieldError('secondaryPatientZip') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientZip')}</p>
                    )}
                    {!getFieldError('secondaryPatientZip') && secondaryZipLoading && (
                      <p className="text-xs text-gray-500 mt-1">Looking up city & state…</p>
                    )}
                    {secondaryZipError && (
                      <p className="text-xs text-red-500 mt-1">{secondaryZipError}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="secondaryPatientState"
                      type="text"
                      placeholder="State"
                      value={insurance.secondaryPatientState ?? ''}
                      onChange={handleChange}
                      readOnly={secondaryCityOptions.length > 0}
                      className={`w-full rounded-2xl border ${getFieldError('secondaryPatientState') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 ${secondaryCityOptions.length > 0 ? 'bg-gray-50' : ''}`}
                      autoComplete="off"
                    />
                    {getFieldError('secondaryPatientState') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientState')}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    {secondaryCityOptions.length > 0 ? (
                      <div className="relative">
                        <CustomSelect
                          label="City"
                          value={insurance.secondaryPatientCity ?? ''}
                          options={secondaryCityOptions.map(c => ({ label: c, value: c }))}
                          onChange={(val) => {
                            setTouched(prev => ({ ...prev, secondaryPatientCity: true }))
                            dispatch(updateField({ section: 'insurance', field: 'secondaryPatientCity', value: val }))
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm text-primaryText mb-2 font-medium">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="secondaryPatientCity"
                          type="text"
                          placeholder="City"
                          value={insurance.secondaryPatientCity ?? ''}
                          onChange={handleChange}
                          className={`w-full rounded-2xl border ${getFieldError('secondaryPatientCity') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                          autoComplete="off"
                        />
                      </>
                    )}
                    {getFieldError('secondaryPatientCity') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('secondaryPatientCity')}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}


        </>
      )}
    </div>
  )
}

export default InsuranceInformation
