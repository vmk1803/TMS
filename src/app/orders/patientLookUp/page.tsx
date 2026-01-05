"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X, Plus } from 'lucide-react'
import DateOfBirthPicker from '../../../components/common/DateOfBirthPicker'
import { usePatientLookup } from './hooks/usePatientLookup'

const PatientLookupPage = () => {
  const router = useRouter()
  const {
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
  } = usePatientLookup()

  const filteredPatients = patients

  return (
    <div className="flex flex-col items-center px-4 py-8 relative">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 flex items-center gap-2 text-gray-700 hover:text-primary transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="text-center mt-12 lg:mt-20">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Create New Order
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Add patient details, order information, and assign technician — all in a few steps
        </p>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row items-center gap-3 mt-8 w-full max-w-2xl">
        <div className="flex items-center border border-green-500 rounded-full px-4 py-3 w-full bg-white shadow-sm">
          <Search className="text-gray-400 w-4 h-4 mr-2" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
          />
          {searchTerm && (
            <X
              className="text-gray-400 w-4 h-4 cursor-pointer"
              onClick={() => {
                setSearchTerm('')
              }}
            />
          )}
        </div>

        <div className="w-full md:w-69">
          <DateOfBirthPicker
            value={dob}
            onChange={(value) => setDob(value)}
          />
        </div>

        <button
          onClick={handleLookup}
          className="bg-secondary text-white rounded-full px-4 py-3 shadow hover:bg-primary transition w-[400px] text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Looking up...' : 'Lookup Patient'}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {(hasSearched || patients.length > 0 || error) && (
        <div className="mt-4 w-full md:w-[700px] bg-white shadow-lg rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-secondary font-semibold text-base">
              Existing Patients
            </h3>
            <button
              onClick={() => router.push('/orders/createNeworder')}
              className="flex items-center gap-1 text-secondary border border-secondary rounded-full px-3 py-1 text-sm font-medium hover:bg-green-50 transition"
            >
              <Plus size={16} /> Add New Patient
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}

          <div className="max-h-64 overflow-y-auto scrollbar-custom pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-2"></div>
                
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const fullName = [patient.first_name, patient.middle_name, patient.last_name]
                  .filter(Boolean)
                  .join(' ')
                const phone = patient.phone_no1 || patient.phone_no2 || ''
                const dobLabel = formatDob(patient.date_of_birth)

                return (
                  <div
                    key={patient.guid}
                    className="border-b last:border-0 px-2 py-3 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <p className="text-text70 font-medium text-sm">{fullName}</p>
                    <p className="text-text70 text-xs">
                      {phone}
                      {dobLabel ? `, ${dobLabel}` : ''}
                    </p>
                  </div>
                )
              })
            ) : (
              !error && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No matching patients found.
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientLookupPage
