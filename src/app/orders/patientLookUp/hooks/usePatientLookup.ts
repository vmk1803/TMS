"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '../../../../store/hooks'
import { updateField, setSelectedPatient } from '../../../../store/ordersSlice'
import { getAllPatients, Patient, PatientAddress, PatientFilters } from '../services/patientLookupService'

export function usePatientLookup() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [dob, setDob] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Auto-search when search term or DOB changes with debounce
  useEffect(() => {
    if (!hasSearched) return

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim() || dob) {
        handleLookup()
      }
    }, 500) // 500ms delay

    setSearchTimeout(timeout)

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchTerm, dob, hasSearched])

  const handleLookup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      const filters: PatientFilters = {}
      if (searchTerm.trim()) {
        filters.full_name = searchTerm.trim()
      }
      if (dob) {
        filters.date_of_birth = dob
      }

      // Use reasonable page size for performance - 50 patients per page
      const items = await getAllPatients(filters, 1, 50)
      setPatients(items)
    } catch (e: any) {
      setError(e?.message || 'Failed to lookup patients')
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    if (!patient) return

    // Set selected patient first to ensure consistent state
    dispatch(setSelectedPatient(patient))

    // Navigate immediately - the useEffect in createNeworder will handle field population
    router.push('/orders/createNeworder?step=1')
  }

   const formatDob = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
   
    // Use UTC methods to avoid timezone conversion issues for DOB
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    const year = date.getUTCFullYear()
   
    return `${month} ${day} ${year}`
  }

  return {
    searchTerm,
    setSearchTerm,
    dob,
    setDob,
    patients,
    isLoading,
    error,
    hasSearched,
    handleLookup,
    handleSelectPatient,
    formatDob,
  }
}
