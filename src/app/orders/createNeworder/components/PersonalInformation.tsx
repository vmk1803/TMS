'use client'
import React, { useEffect, useState } from 'react'
import { useOrderForm } from '../hooks/useOrderForm'
import { X } from '../../../../components/Icons'
import { GENDER_OPTIONS, RACE_OPTIONS, ETHNICITY_OPTIONS } from '../../../../lib/orderEnums'
import DateOfBirthPicker from '../../../../components/common/DateOfBirthPicker'
import { getStateByZip } from '../services/ordersService'
import CustomSelect from '../../../../components/common/CustomSelect'
const PersonalInformation = ({ submitAttempted = false }: { submitAttempted?: boolean }) => {
  const { order, setField, validateSection, clearField } = useOrderForm()
  const personal = order.personal || {}
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const [zipLoading, setZipLoading] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)
  const [lastZipFetched, setLastZipFetched] = useState('')

  // Pickup Zip State
  const [pickupCityOptions, setPickupCityOptions] = useState<string[]>([])
  const [pickupZipLoading, setPickupZipLoading] = useState(false)
  const [pickupZipError, setPickupZipError] = useState<string | null>(null)
  const [lastPickupZipFetched, setLastPickupZipFetched] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const field = target.name
    let value: any = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value


    if (field === 'firstName' || field === 'middleName' || field === 'lastName') {
      value = String(value).replace(/[^A-Za-z\s]/g, '')
    }


    if (field === 'mobile1' || field === 'mobile2') {
      value = String(value).replace(/\D/g, '').slice(0, 10)
    }

    setTouched(prev => ({ ...prev, [field]: true }))
    setField('personal', field, value)
  }

  const handleClearSelect = (fieldName: string) => {
    clearField('personal', fieldName)
    setTouched(prev => ({ ...prev, [fieldName]: true }))
  }

  const handleDateChange = (date: string | null) => {
    setTouched(prev => ({ ...prev, dob: true }))
    setField('personal', 'dob', date || '')
  }

  useEffect(() => {
    const validationErrors = validateSection('personal')
    setErrors(validationErrors)
  }, [personal, validateSection])

  useEffect(() => {
    const zip = (personal.zip || '').trim()
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastZipFetched) {
      setZipLoading(true)
      setZipError(null)
      setLastZipFetched(zip)
      getStateByZip(zip)
        .then(res => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || ''
          const stateVal = res?.state || res?.data?.state || res?.data?.State || ''
          let citiesArr: string[] = res?.cities || res?.data?.cities || []

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr]
          }

          if (stateVal) {
            setField('personal', 'state', stateVal)
            setTouched(prev => ({ ...prev, state: true }))
          }

          setCityOptions(citiesArr)

          if (apiCity) {
            setField('personal', 'city', apiCity)
            setTouched(prev => ({ ...prev, city: true }))
          } else if (citiesArr.length === 1) {
            setField('personal', 'city', citiesArr[0])
            setTouched(prev => ({ ...prev, city: true }))
          } else if (citiesArr.length > 0 && personal.city && !citiesArr.includes(personal.city)) {
            setField('personal', 'city', '')
          }
        })
        .catch(e => {
          setZipError(e?.message || 'Zip lookup failed')
          setCityOptions([])
        })
        .finally(() => {
          setZipLoading(false)
        })
    } else if (zip.length !== 5) {
      setCityOptions([])
      setZipError(null)
      if (lastZipFetched && zip.length < 5) setLastZipFetched('')
    }
  }, [personal.zip, lastZipFetched, personal.city, setField])

  // Pickup Zip Effect
  useEffect(() => {
    const zip = (personal.pickup_zip || '').trim()
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastPickupZipFetched) {
      setPickupZipLoading(true)
      setPickupZipError(null)
      setLastPickupZipFetched(zip)
      getStateByZip(zip)
        .then(res => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || ''
          const stateVal = res?.state || res?.data?.state || res?.data?.State || ''
          let citiesArr: string[] = res?.cities || res?.data?.cities || []

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr]
          }

          if (stateVal) {
            setField('personal', 'pickup_state', stateVal)
            setTouched(prev => ({ ...prev, pickup_state: true }))
          }

          setPickupCityOptions(citiesArr)

          if (apiCity) {
            setField('personal', 'pickup_city', apiCity)
            setTouched(prev => ({ ...prev, pickup_city: true }))
          } else if (citiesArr.length === 1) {
            setField('personal', 'pickup_city', citiesArr[0])
            setTouched(prev => ({ ...prev, pickup_city: true }))
          } else if (citiesArr.length > 0 && personal.pickup_city && !citiesArr.includes(personal.pickup_city)) {
            setField('personal', 'pickup_city', '')
          }
        })
        .catch(e => {
          setPickupZipError(e?.message || 'Zip lookup failed')
          setPickupCityOptions([])
        })
        .finally(() => {
          setPickupZipLoading(false)
        })
    } else if (zip.length !== 5) {
      setPickupCityOptions([])
      setPickupZipError(null)
      if (lastPickupZipFetched && zip.length < 5) setLastPickupZipFetched('')
    }
  }, [personal.pickup_zip, lastPickupZipFetched, personal.pickup_city, setField])

  const getFieldError = (fieldName: string) => {
    return (touched[fieldName] || submitAttempted) && errors[fieldName] ? errors[fieldName][0] : null
  }

  return (
    <div className="bg-white rounded-xl">
      {/* Section Title */}
      <h2 className="text-[20px] font-semibold text-primaryText mb-6">
        Personal Details
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* First Name */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={personal.firstName ?? ''}
            onChange={handleChange}
            className={`w-full rounded-2xl border ${getFieldError('firstName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
            autoComplete="off"
          />
          {getFieldError('firstName') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('firstName')}</p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Middle Name
          </label>
          <input
            name="middleName"
            type="text"
            placeholder="Middle Name"
            value={personal.middleName ?? ''}
            onChange={handleChange}
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
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={personal.lastName ?? ''}
            onChange={handleChange}
            className={`w-full rounded-2xl border ${getFieldError('lastName') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
            autoComplete="off"
          />
          {getFieldError('lastName') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('lastName')}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <CustomSelect
            label="Gender"
            value={personal.gender ?? ''}
            options={GENDER_OPTIONS}
            onChange={(val) => {
              setTouched(prev => ({ ...prev, gender: true }))
              setField('personal', 'gender', val)
            }}
            required
          />
          {getFieldError('gender') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('gender')}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <DateOfBirthPicker
            name="dob"
            value={personal.dob ?? ''}
            onChange={handleDateChange}
            error={!!getFieldError('dob')}
            placeholder="MM-DD-YYYY"
          />
          {getFieldError('dob') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('dob')}</p>
          )}
        </div>

        {/* Mobile Number 1 */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Mobile Number 1 <span className="text-red-500">*</span>
          </label>
          <div>
            <input
              name="mobile1"
              type="tel"
              placeholder="Mobile Number"
              value={personal.mobile1 ?? ''}
              onChange={handleChange}
              maxLength={10}
              pattern="[0-9]*"
              className={`w-full rounded-2xl border ${getFieldError('mobile1') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
              autoComplete="off"
            />
            {getFieldError('mobile1') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('mobile1')}</p>
            )}
          </div>
        </div>

        {/* Mobile Number 2 */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Mobile Number 2
          </label>
          <div>
            <input
              name="mobile2"
              type="tel"
              placeholder="Optional"
              value={personal.mobile2 ?? ''}
              onChange={handleChange}
              maxLength={10}
              pattern="[0-9]*"
              className={`w-full rounded-2xl border ${getFieldError('mobile2') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500`}
              autoComplete="off"
            />
            {getFieldError('mobile2') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('mobile2')}</p>
            )}
          </div>
        </div>

        {/* Email ID */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Email ID
          </label>
          <input
            name="email"
            type="email"
            placeholder="Enter Email ID"
            value={personal.email ?? ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500"
            autoComplete="off"
          />
          {getFieldError('email') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
          )}
        </div>
      </div>

      {/* ========== ADDRESS ========== */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[20px] font-semibold text-primaryText">
          Address
        </h2>
        <div className="flex flex-col items-end">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              name="addPickupAddress"
              type="checkbox"
              checked={personal.addPickupAddress === true}
              onChange={handleChange}
              className="peer h-4 w-4 rounded border-formBorder accent-[#22C55E] focus:ring-0"
            />
            Use patient address for pickup
          </label>

          {getFieldError('addPickupAddress') && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {getFieldError('addPickupAddress')}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            name="address1"
            type="text"
            placeholder="Address Line 1"
            value={personal.address1 ?? ''}
            onChange={handleChange}
            className={`w-full rounded-2xl border ${getFieldError('address1') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
            autoComplete="off"
          />
          {getFieldError('address1') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('address1')}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Address Line 2
          </label>
          <input
            name="address2"
            type="text"
            placeholder="Address Line 2"
            value={personal.address2 ?? ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
            autoComplete="off"
          />
        </div>
        {/* Zip */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Zip<span className="text-red-500">*</span>
          </label>
          <input
            name="zip"
            type="text"
            placeholder="Zip / Postal Code"
            value={personal.zip ?? ''}
            onChange={handleChange}
            maxLength={5}
            className={`w-full rounded-2xl border ${getFieldError('zip') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
            autoComplete="off"
          />
          {getFieldError('zip') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('zip')}</p>
          )}
          {!getFieldError('zip') && zipLoading && (
            <p className="text-xs text-gray-500 mt-1">Looking up city & state…</p>
          )}
          {zipError && (
            <p className="text-xs text-red-500 mt-1">{zipError}</p>
          )}
        </div>

        {/* State (read-only when auto-populated) */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            State <span className="text-red-500">*</span>
          </label>
          <input
            name="state"
            type="text"
            placeholder="State"
            value={personal.state ?? ''}
            onChange={handleChange}
            readOnly={cityOptions.length > 0}
            className={`w-full rounded-2xl border ${getFieldError('state') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 ${cityOptions.length > 0 ? 'bg-gray-50' : ''}`}
          />
          {getFieldError('state') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('state')}</p>
          )}
        </div>

        {/* City (select when auto-populated) */}
        <div>
          {cityOptions.length > 0 ? (
            <div className="relative">
              <CustomSelect
                label="City"
                value={personal.city ?? ''}
                options={cityOptions.map(c => ({ label: c, value: c }))}
                onChange={(val) => {
                  setTouched(prev => ({ ...prev, city: true }))
                  setField('personal', 'city', val)
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
                name="city"
                type="text"
                placeholder="City"
                value={personal.city ?? ''}
                onChange={handleChange}
                className={`w-full rounded-2xl border ${getFieldError('city') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
            </>
          )}
          {getFieldError('city') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('city')}</p>
          )}
        </div>
      </div>

      {/* ========== PICKUP ADDRESS (optional) ========== */}
      {personal.addPickupAddress !== true ? (
        <>
          <h2 className="text-[20px] font-semibold text-primaryText mb-4">Pickup Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Pickup Address Line 1 */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Pickup Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                name="pickup_address1"
                type="text"
                placeholder="Pickup Address Line 1"
                value={personal.pickup_address1 ?? ''}
                onChange={handleChange}
                className={`w-full rounded-2xl border ${getFieldError('pickup_address1') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
              {getFieldError('pickup_address1') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('pickup_address1')}</p>
              )}
            </div>
            {/* Pickup Address Line 2 */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">Pickup Address Line 2</label>
              <input
                name="pickup_address2"
                type="text"
                placeholder="Pickup Address Line 2"
                value={personal.pickup_address2 ?? ''}
                onChange={handleChange}
                className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
                autoComplete="off"
              />
            </div>
            {/* Pickup Zip */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Pickup Zip <span className="text-red-500">*</span>
              </label>
              <input
                name="pickup_zip"
                type="text"
                placeholder="Pickup Zip / Postal Code"
                value={personal.pickup_zip ?? ''}
                onChange={handleChange}
                maxLength={5}
                className={`w-full rounded-2xl border ${getFieldError('pickup_zip') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                autoComplete="off"
              />
              {getFieldError('pickup_zip') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('pickup_zip')}</p>
              )}
              {!getFieldError('pickup_zip') && pickupZipLoading && (
                <p className="text-xs text-gray-500 mt-1">Looking up city & state…</p>
              )}
              {pickupZipError && (
                <p className="text-xs text-red-500 mt-1">{pickupZipError}</p>
              )}
            </div>

            {/* Pickup State */}
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Pickup State <span className="text-red-500">*</span>
              </label>
              <input
                name="pickup_state"
                type="text"
                placeholder="Pickup State"
                value={personal.pickup_state ?? ''}
                onChange={handleChange}
                readOnly={pickupCityOptions.length > 0}
                className={`w-full rounded-2xl border ${getFieldError('pickup_state') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600 ${pickupCityOptions.length > 0 ? 'bg-gray-50' : ''}`}
              />
              {getFieldError('pickup_state') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('pickup_state')}</p>
              )}
            </div>
            {/* Pickup City */}
            <div>
              {pickupCityOptions.length > 0 ? (
                <div className="relative">
                  <CustomSelect
                    label="Pickup City"
                    value={personal.pickup_city ?? ''}
                    options={pickupCityOptions.map(c => ({ label: c, value: c }))}
                    onChange={(val) => {
                      setTouched(prev => ({ ...prev, pickup_city: true }))
                      setField('personal', 'pickup_city', val)
                    }}
                    required
                  />
                </div>
              ) : (
                <>
                  <label className="block text-sm text-primaryText mb-2 font-medium">
                    Pickup City <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="pickup_city"
                    type="text"
                    placeholder="Pickup City"
                    value={personal.pickup_city ?? ''}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border ${getFieldError('pickup_city') ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600`}
                    autoComplete="off"
                  />
                </>
              )}
              {getFieldError('pickup_city') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('pickup_city')}</p>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* ========== OTHER INFO ========== */}
      <h2 className="text-[20px] font-semibold text-primaryText mb-4">
        Other Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Race */}
        <div className="md:col-span-1 relative">
          <CustomSelect
            label="Race"
            value={personal.race ?? ''}
            options={RACE_OPTIONS.map(r => ({ label: r, value: r }))}
            onChange={(val) => {
              setTouched(prev => ({ ...prev, race: true }))
              setField('personal', 'race', val)
            }}
          />
        </div>



        {/* Ethnicity */}
        <div className="md:col-span-1 relative">
          <CustomSelect
            label="Ethnicity"
            value={personal.ethnicity ?? ''}
            options={ETHNICITY_OPTIONS.map(e => ({ label: e, value: e }))}
            onChange={(val) => {
              setTouched(prev => ({ ...prev, ethnicity: true }))
              setField('personal', 'ethnicity', val)
            }}
          />
        </div>


        {/* Homebound patient (toggle) */}
        <div className="md:col-span-1 flex items-end">
          <div className="flex items-center gap-3 mt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input name="homebound" type="checkbox" checked={personal.homebound ?? false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
            <span className="text-sm text-primaryText">Homebound patient</span>
          </div>
        </div>

        {/* Hard Stick (checkbox) */}
        <div className="md:col-span-3">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              name="hardStick"
              type="checkbox"
              checked={personal.hardStick ?? false}
              onChange={handleChange}
              className="peer h-4 w-4 rounded border-formBorder accent-[#22C55E] focus:ring-0"
            />
            Hard Stick
          </label>
        </div>

        {/* Patient Notes */}
        <div className="md:col-span-3">
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Patient Notes
          </label>
          <textarea
            name="patientNotes"
            placeholder="Additional notes about the patient..."
            rows={4}
            value={personal.patientNotes ?? ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-formBorder bg-formBg px-4 py-3 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
          />
        </div>
      </div>

    </div>
  )
}

export default PersonalInformation
