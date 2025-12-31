"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateField } from '../../../../store/ordersSlice'
import { X, ChevronDown } from 'lucide-react'
import { getAllTests, getAllPartners, getPhysiciansByPartnerGuid, getIcdCodes } from '../services/ordersService'
import type { Test } from '../../../../types/order'
import { useOrderForm } from '../hooks/useOrderForm'
import Image from 'next/image'
import { SERVICE_OPTIONS } from '../../../../lib/orderEnums'
import ICDCodesInput from './ICDCodesInput'
import CustomSelect from '../../../../components/common/CustomSelect'


const CaseInformation: React.FC<{ submitAttempted?: boolean }> = ({ submitAttempted = false }) => {
  const dispatch = useAppDispatch()
  const caseInfo = useAppSelector((s: any) => s.orders.caseInfo || {})
  const { validateSection } = useOrderForm()
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [testSearch, setTestSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Services dropdown state
  const [servicesSearch, setServicesSearch] = useState('')
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const servicesDropdownRef = useRef<HTMLDivElement | null>(null)

  // Close services dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])



  const selectedTests: Test[] = caseInfo.selectedTests || []

  useEffect(() => {
    const fetchAllTests = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const allTests = await getAllTests()
        setTests(allTests)
      } catch (error: any) {
        setError(error.message || 'Failed to fetch tests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllTests()
  }, [])
  const [partners, setPartners] = useState<any[]>([])
  const [physicians, setPhysicians] = useState<any[]>([])
  const [physiciansLoading, setPhysiciansLoading] = useState(false)
  const [physiciansError, setPhysiciansError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await getAllPartners()
        setPartners(response)
      } catch (error: any) {
        console.error('Error fetching partners:', error)
      }
    }

    fetchPartners()
  }, [])


  /** Add selected test to list */
  const handleTestSelect = (test: Test) => {
    // Prevent duplicates
    const alreadySelected = selectedTests.some((t) => t.id === test.id)
    if (alreadySelected) return

    const updated = [...selectedTests, test]
    const formatLabel = (tt: Test) => {
      const firstTube = Array.isArray(tt.tube_info) && tt.tube_info.length > 0 ? tt.tube_info[0]?.tube_name : undefined
      return firstTube ? `${tt.test_name} - ${firstTube}` : (tt.test_name || '')
    }

    dispatch(updateField({ section: 'caseInfo', field: 'selectedTests', value: updated }))
    // Store GUIDs for payload consumption
    dispatch(updateField({ section: 'caseInfo', field: 'test_info', value: updated.map(t => t.guid) }))
    // Also keep text testName in sync for validation (include tube name when available)
    dispatch(updateField({ section: 'caseInfo', field: 'testName', value: updated.map(formatLabel).join(', ') }))
    setShowDropdown(false)
  }

  /** 🔹 Remove test from selected list */
  const handleRemoveTest = (testId: number) => {
    const updated = selectedTests.filter((t) => t.id !== testId)
    const formatLabel = (tt: Test) => {
      const firstTube = Array.isArray(tt.tube_info) && tt.tube_info.length > 0 ? tt.tube_info[0]?.tube_name : undefined
      return firstTube ? `${tt.test_name} - ${firstTube}` : (tt.test_name || '')
    }

    dispatch(updateField({ section: 'caseInfo', field: 'selectedTests', value: updated }))
    // Keep GUIDs in sync after removal
    dispatch(updateField({ section: 'caseInfo', field: 'test_info', value: updated.map(t => t.guid) }))
    // Update the textual testName field to include tube names when available
    dispatch(updateField({ section: 'caseInfo', field: 'testName', value: updated.map(formatLabel).join(', ') }))
  }

  /** 🔹 Handle generic field changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    setTouched((prev) => ({ ...prev, [target.name]: true }))
    dispatch(updateField({ section: 'caseInfo', field: target.name, value }))
    if (target.name === 'orderingFacility') {
      // Clear existing physician selection when facility changes
      dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysician', value: '' }))
      dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysicianName', value: '' }))
    }
    if (target.name === 'orderingPhysician') {
      const phy = physicians.find((p: any) => String(p.guid) === String(value))
      if (phy) {
        const fullName = [phy.first_name, phy.middle_name, phy.last_name].filter(Boolean).join(' ')
        dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysicianName', value: fullName }))
      }
    }
  }

  useEffect(() => {
    const v = validateSection('caseInfo')
    setErrors(v)
  }, [caseInfo])

  const getFieldError = (fieldName: string) => {
    return (touched[fieldName] || submitAttempted) && errors[fieldName] ? errors[fieldName][0] : null
  }

  const containerCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}

    selectedTests.forEach((test) => {
      if (!Array.isArray(test.tube_info)) return

      test.tube_info.forEach((tube: any) => {
        if (!tube || !tube.tube_name) return

        const key = String(tube.tube_name).trim()
        if (!key) return

        counts[key] = (counts[key] || 0) + 1
      })
    })

    return counts
  }, [selectedTests])

  const filteredTests = React.useMemo(() => {
    if (!testSearch.trim()) return tests
    const q = testSearch.toLowerCase()
    return tests.filter((t) => (t.test_name.toLowerCase().includes(q) || (t.test_code.toLowerCase().includes(q))))
  }, [tests, testSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])



  // Fetch physicians when ordering facility changes
  useEffect(() => {
    const guid = caseInfo.orderingFacility
    if (!guid) {
      setPhysicians([])
      setPhysiciansError(null)
      setPhysiciansLoading(false)
      return
    }
    let mounted = true
    setPhysiciansLoading(true)
    setPhysiciansError(null)
    getPhysiciansByPartnerGuid(guid)
      .then((list) => {
        if (!mounted) return
        setPhysicians(list)
      })
      .catch((err: any) => {
        if (!mounted) return
        setPhysicians([])
        setPhysiciansError(err?.message || 'Failed to fetch physicians')
      })
      .finally(() => {
        if (!mounted) return
        setPhysiciansLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [caseInfo.orderingFacility])

  return (
    <>
      <div className="bg-white">

        {/* Section Title */}
        <h2 className="text-[20px] font-semibold text-primaryText mb-6">
          Case Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* ==================== Test Name ==================== */}
          <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              Test Name <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <input
                name="testName"
                type="text"
                placeholder="Search tests"
                value={testSearch}
                onChange={(e) => {
                  setTestSearch(e.target.value)
                  setShowDropdown(true)
                  setTouched((prev) => ({ ...prev, testName: true }))
                }}
                onFocus={() => {
                  setShowDropdown(true)
                  setTouched((prev) => ({ ...prev, testName: true }))
                }}
                className={`w-full rounded-2xl border ${getFieldError('testName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText 
            focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
                autoComplete="off"
              />
              {showDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto scrollbar-custom">
                  {isLoading && (
                    <div className="flex items-center justify-center min-h-[120px]">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                    </div>
                  )}
                  {error && (
                    <div className="px-4 py-2 text-xs text-red-500">{error}</div>
                  )}
                  {!isLoading && !error && filteredTests.map((test) => {
                    const isSelected = selectedTests.some((t) => t.id === test.id)
                    return (
                      <div
                        key={test.id}
                        onClick={() => {
                          const alreadySelected = selectedTests.some((t) => t.id === test.id)
                          const formatLabel = (tt: Test) => {
                            const firstTube = Array.isArray(tt.tube_info) && tt.tube_info.length > 0 ? tt.tube_info[0]?.tube_name : undefined
                            return firstTube ? `${tt.test_name} - ${firstTube}` : (tt.test_name || '')
                          }

                          if (alreadySelected) {
                            const updated = selectedTests.filter((t) => t.id !== test.id)
                            dispatch(updateField({ section: 'caseInfo', field: 'selectedTests', value: updated }))
                            dispatch(updateField({ section: 'caseInfo', field: 'test_info', value: updated.map((t) => t.guid) }))
                            dispatch(updateField({ section: 'caseInfo', field: 'testName', value: updated.map(formatLabel).join(', ') }))
                          } else {
                            const updated = [...selectedTests, test]
                            dispatch(updateField({ section: 'caseInfo', field: 'selectedTests', value: updated }))
                            dispatch(updateField({ section: 'caseInfo', field: 'test_info', value: updated.map((t) => t.guid) }))
                            dispatch(updateField({ section: 'caseInfo', field: 'testName', value: updated.map(formatLabel).join(', ') }))
                          }
                          setTestSearch('')
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer border-b last:border-0 flex items-center justify-between ${isSelected ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        <span>{(() => {
                          const firstTube = Array.isArray(test.tube_info) && test.tube_info.length > 0 ? test.tube_info[0]?.tube_name : undefined
                          return firstTube ? `${test.test_name} - ${firstTube}` : test.test_name
                        })()}</span>
                        {isSelected && <span className="text-xs font-semibold">Selected</span>}
                      </div>
                    )
                  })}
                  {!isLoading && !error && filteredTests.length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-500">No tests found</div>
                  )}
                </div>
              )}
            </div>
            {getFieldError('testName') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('testName')}</p>
            )}
          </div>


          {/* ==================== ICD Codes ==================== */}
          {/* ==================== ICD Codes ==================== */}
          <ICDCodesInput
            value={Array.isArray(caseInfo.icdCodes) ? caseInfo.icdCodes : []}
            onChange={(newCodes) => {
              setTouched((prev) => ({ ...prev, icdCodes: true }))
              dispatch(updateField({ section: 'caseInfo', field: 'icdCodes', value: newCodes }))
            }}
            error={getFieldError('icdCodes')}
            touched={!!touched.icdCodes || submitAttempted}
          />
        </div>

        {/* ==================== Ordering Facility / Physician / Services ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Ordering Facility */}
          <div>
            <CustomSelect
              label="Ordering Facility"
              value={caseInfo.orderingFacility ?? ""}
              options={partners.map((p) => ({ label: p.name, value: p.guid }))}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, orderingFacility: true }))
                dispatch(updateField({ section: 'caseInfo', field: 'orderingFacility', value: val }))
                // Clear existing physician selection when facility changes
                dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysician', value: '' }))
                dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysicianName', value: '' }))
              }}
              required
              searchable={true}
            />
            {getFieldError("orderingFacility") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError("orderingFacility")}</p>
            )}
          </div>

          {/* Ordering Physician */}
          <div>
            <CustomSelect
              label="Ordering Physician"
              value={caseInfo.orderingPhysician ?? ""}
              options={physicians.map((phy) => {
                const fullName = [phy.first_name, phy.middle_name, phy.last_name].filter(Boolean).join(" ");
                return { label: fullName, value: phy.guid };
              })}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, orderingPhysician: true }))
                dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysician', value: val }))
                const phy = physicians.find((p: any) => String(p.guid) === String(val))
                if (phy) {
                  const fullName = [phy.first_name, phy.middle_name, phy.last_name].filter(Boolean).join(' ')
                  dispatch(updateField({ section: 'caseInfo', field: 'orderingPhysicianName', value: fullName }))
                }
              }}
              required
              searchable={true}
            />
            {getFieldError("orderingPhysician") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError("orderingPhysician")}</p>
            )}
          </div>

          {/* Services */}
          <div className="md:col-span-1 relative" ref={servicesDropdownRef}>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              Services <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`w-full rounded-2xl border ${touched.services && getFieldError("services") ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText flex items-center justify-between cursor-pointer`}
              >
                <span>
                  {Array.isArray(caseInfo.services) && caseInfo.services.length > 0
                    ? `${caseInfo.services.length} Selected`
                    : "Select Services"}
                </span>
                <ChevronDown size={18} className={`transition-transform text-gray-500 ${servicesDropdownOpen ? "rotate-180 text-green-600" : ""}`} />
              </div>

              {servicesDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto scrollbar-custom">
                  {SERVICE_OPTIONS.map((service, index) => {
                    const isSelected = Array.isArray(caseInfo.services) && caseInfo.services.includes(service)
                    return (
                      <div
                        key={`${service}-${index}`}
                        onClick={() => {
                          const current = Array.isArray(caseInfo.services) ? caseInfo.services : []
                          let updated
                          if (isSelected) {
                            updated = current.filter((s: string) => s !== service)
                          } else {
                            updated = [...current, service]
                          }
                          setTouched((prev) => ({ ...prev, services: true }))
                          dispatch(updateField({ section: 'caseInfo', field: 'services', value: updated }))
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer border-b last:border-0 flex items-center justify-between ${isSelected ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                      >
                        <span className="font-medium">{service}</span>
                        {isSelected && <span className="text-xs font-semibold">Selected</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {getFieldError("services") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError("services")}</p>
            )}

            {/* Selected Services Tags */}
            {Array.isArray(caseInfo.services) && caseInfo.services.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {caseInfo.services.map((service: string) => (
                  <div key={service} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <span>{service}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = caseInfo.services.filter((s: string) => s !== service);
                        dispatch(updateField({ section: 'caseInfo', field: 'services', value: updated }));
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/*  Selected ICD Codes, Selected Tests & Tubes */}
        <div className="mb-6">
          {Array.isArray(caseInfo.icdCodes) && caseInfo.icdCodes.length > 0 && (
            <div>
              <label className="block text-sm text-primaryText mb-2  font-bold">
                Selected ICD Codes
              </label>

              <div className="flex flex-wrap gap-3 mt-3">
                {caseInfo.icdCodes.map((code: string) => (
                  <div
                    key={code}
                    className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full"
                  >
                    <span>{code}</span>
                    <button
                      onClick={() => {
                        const updated = caseInfo.icdCodes.filter((c: string) => c !== code);
                        dispatch(updateField({
                          section: "caseInfo",
                          field: "icdCodes",
                          value: updated
                        }));
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(selectedTests) && selectedTests.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm text-primaryText mb-2  font-bold">Selected Test’s</label>

              {/* Selected Test Tags */}
              <div className="flex flex-wrap gap-3 mt-3">
                {selectedTests.map((t) => {
                  const firstTube = Array.isArray(t.tube_info) && t.tube_info.length > 0 ? t.tube_info[0]?.tube_name : undefined
                  const label = firstTube ? `${t.test_name} - ${firstTube}` : (t.test_name || '')
                  return (
                    <div key={t.id} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {label}
                      <button onClick={() => handleRemoveTest(t.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {Array.isArray(selectedTests) && selectedTests.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm text-primaryText mb-2 font-bold">Required Test Tubes</label>
              <div className="flex flex-wrap gap-3 min-h-[24px]">
                {Object.entries(containerCounts).map(([tubeName, count]) => (
                  <div key={tubeName} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <span>{tubeName}</span>
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-white text-xs text-green-700 border border-green-300">
                      {count > 4 ? 4 : count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CaseInformation
