'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Input, Select, message } from 'antd'
import { Plus, Pencil, Trash2Icon, ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import timezones from 'timezones-list'
import { useLocations, useLocation } from '@/hooks/useLocations'

const { Option } = Select

interface LocationAddress {
  id: number // For frontend management
  country: string
  state?: string
  city: string
  timeZone: string
  addressLine?: string
  streetAddress: string
  zip: string
  address?: string // For display purposes
}

interface LocationFormData {
  countryIso: string
  stateIso: string
  cityIso: string
  country: string
  state: string
  city: string
  timeZone: string
  addressLine: string
  streetAddress: string
  zip: string
}

export default function CreateEditLocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locationId = searchParams.get('locationId')

  const isEdit = Boolean(locationId)

  // Use hooks for API integration
  const { createLocation, updateLocation } = useLocations()
  const { location, loading: locationLoading, error: locationError } = useLocation(locationId || null)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<LocationFormData>({
    countryIso: '',
    stateIso: '',
    cityIso: '',
    country: '',
    state: '',
    city: '',
    timeZone: '',
    addressLine: '',
    streetAddress: '',
    zip: '',
  })

  const [addresses, setAddresses] = useState<LocationAddress[]>([])
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)

  const [countries] = useState(Country.getAllCountries())
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

  // Load data for edit mode
  useEffect(() => {
    if (isEdit && location) {
      // For edit mode, we load the single location data
      const formattedAddress: LocationAddress = {
        id: 1, // Single address for editing
        country: location.country,
        state: location.state,
        city: location.city,
        timeZone: location.timeZone,
        addressLine: location.addressLine,
        streetAddress: location.streetAddress,
        zip: location.zip,
        address: location.streetAddress // For display
      }

      setAddresses([formattedAddress])
    }
  }, [isEdit, location])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.timeZone.trim()) {
      newErrors.timeZone = 'Time zone is required'
    }
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Address line is required'
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required'
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'Zip code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LocationFormData, value: any) => {
    if (field === 'country') {
      const selectedCountry = countries.find(c => c.name === value)
      if (selectedCountry) {
        const countryStates = State.getStatesOfCountry(selectedCountry.isoCode)
        setStates(countryStates)
        setCities([])
        setFormData(prev => ({
          ...prev,
          countryIso: selectedCountry.isoCode,
          country: selectedCountry.name,
          stateIso: '',
          state: '',
          cityIso: '',
          city: ''
        }))
      }
    } else if (field === 'state') {
      const selectedState = states.find(s => s.name === value)
      if (selectedState) {
        const stateCities = City.getCitiesOfState(formData.countryIso, selectedState.isoCode)
        setCities(stateCities)
        setFormData(prev => ({
          ...prev,
          stateIso: selectedState.isoCode,
          state: selectedState.name,
          cityIso: '',
          city: ''
        }))
      }
    } else if (field === 'city') {
      const selectedCity = cities.find(c => c.name === value)
      if (selectedCity) {
        // Auto-fill time zone based on country
        const matchingTimezone = timezones.find(tz => tz.label.includes(formData.country))
        setFormData(prev => ({
          ...prev,
          cityIso: selectedCity.isoCode,
          city: selectedCity.name,
          timeZone: matchingTimezone ? matchingTimezone.label : prev.timeZone
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddAddress = () => {
    if (!validateForm()) {
      return
    }

    const addressData: LocationAddress = {
      id: editingAddressId || Date.now(),
      country: formData.country,
      city: formData.city,
      timeZone: formData.timeZone,
      addressLine: formData.addressLine || undefined,
      address: formData.streetAddress,
      state: formData.state,
      streetAddress: formData.streetAddress,
      zip: formData.zip,
    }

    if (editingAddressId) {
      // Update existing address
      setAddresses(prev => prev.map(addr =>
        addr.id === editingAddressId ? addressData : addr
      ))
      setEditingAddressId(null)
    } else {
      // Add new address
      setAddresses(prev => [...prev, addressData])
    }

    // Reset form
    setFormData({
      countryIso: '',
      stateIso: '',
      cityIso: '',
      country: '',
      state: '',
      city: '',
      timeZone: '',
      addressLine: '',
      streetAddress: '',
      zip: '',
    })

    // Clear states and cities when resetting form
    setStates([])
    setCities([])
  }

  const handleEditAddress = (id: number) => {
    const address = addresses.find(addr => addr.id === id)
    if (address) {
      // Find country ISO from name
      const selectedCountry = countries.find(c => c.name === address.country)
      let countryIso = ''
      let stateIso = ''
      let cityIso = ''

      if (selectedCountry) {
        countryIso = selectedCountry.isoCode

        // Populate states for the selected country
        const countryStates = State.getStatesOfCountry(selectedCountry.isoCode)
        setStates(countryStates)

        // Find state ISO from name if state exists
        if (address.state) {
          const selectedState = countryStates.find(s => s.name === address.state)
          if (selectedState) {
            stateIso = selectedState.isoCode

            // Populate cities for the selected state
            const stateCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
            setCities(stateCities)

            // Find city ISO from name
            const selectedCity = stateCities.find(c => c.name === address.city)
            if (selectedCity) {
              cityIso = (selectedCity as any).isoCode
            }
          }
        }
      }

      setFormData({
        countryIso,
        stateIso,
        cityIso,
        country: address.country,
        state: address.state || '',
        city: address.city,
        timeZone: address.timeZone,
        addressLine: address.addressLine || '',
        streetAddress: address.streetAddress || address.address || '',
        zip: address.zip || '',
      })

      setEditingAddressId(id)
    }
  }

  const handleDeleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const handleSubmit = async () => {
    if (addresses.length === 0) {
      message.error('Please add at least one address')
      return
    }

    // Convert frontend addresses to API format
    const apiAddresses = addresses.map(addr => ({
      country: addr.country,
      state: addr.state,
      city: addr.city,
      timeZone: addr.timeZone,
      addressLine: addr.addressLine,
      streetAddress: addr.streetAddress,
      zip: addr.zip
    }))



    setLoading(true)
    try {
      if (isEdit && locationId) {
        // Update existing location
        await updateLocation(locationId, { addresses: apiAddresses })
        message.success('Location updated successfully')
      } else {
        // Create multiple locations - one for each address
        const response = await createLocation({ addresses: apiAddresses })
        if (response) {
          message.success(`${response.locations.length} locations created successfully`)
        }
      }

      router.push('/user-management/locations')
    } catch (error) {
      console.error('Location submission error:', error)
      message.error('Failed to save location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between" onClick={() => router.back()} >
          <ChevronLeft size={16} className='text-secondary' /> <span className='text-sm'> Back</span>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.back()} disabled={loading} className="rounded-xl border-secondary text-secondary">
            Cancel
          </Button>
          <Button
            type="primary"
            className="bg-secondary rounded-xl"
            onClick={handleSubmit}
            loading={loading}
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* ================= ADD LOCATION FORM ================= */}
      <Card className="rounded-xl">
         <label className="text-sm font-large font-bold mb-4 block mt-0">
              Locations Details
            </label>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">
              Country*
              {errors.country && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select
              placeholder="Select"
              className={`w-full rounded-xl bg-[#efeff5] ${errors.country ? 'border-red-500' : ''}`}
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
            >
              {countries.map(country => (
                <Option key={country.isoCode} value={country.name}>
                  {country.name}
                </Option>
              ))}
            </Select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">State*</label>
            <Select
              placeholder="Select"
              className="w-full rounded-xl bg-[#efeff5]"
              value={formData.state}
              onChange={(value) => handleInputChange('state', value)}
            >
              {states.map(state => (
                <Option key={state.isoCode} value={state.name}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">
              City*
              {errors.city && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select
              placeholder="Select"
              className={`w-full rounded-xl bg-[#efeff5] ${errors.city ? 'border-red-500' : ''}`}
              value={formData.city}
              onChange={(value) => handleInputChange('city', value)}
            >
              {cities.map(city => (
                <Option key={city.isoCode} value={city.name}>
                  {city.name}
                </Option>
              ))}
            </Select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Time Zone*
              {errors.timeZone && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select
              placeholder="Select"
              className={`w-full rounded-xl bg-[#efeff5] ${errors.timeZone ? 'border-red-500' : ''}`}
              value={formData.timeZone}
              onChange={(value) => handleInputChange('timeZone', value)}
            >
              {timezones.map(tz => (
                <Option key={tz.tzCode} value={tz.label}>
                  {tz.label}
                </Option>
              ))}
            </Select>
            {errors.timeZone && (
              <p className="text-red-500 text-xs mt-1">{errors.timeZone}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Address Line*
              {errors.addressLine && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Address Line"
              className={`rounded-xl bg-[#efeff5] ${errors.addressLine ? 'border-red-500' : ''}`}
              value={formData.addressLine}
              onChange={(e) => handleInputChange('addressLine', e.target.value)}
            />
            {errors.addressLine && (
              <p className="text-red-500 text-xs mt-1">{errors.addressLine}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">
              Street Address*
              {errors.streetAddress && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Street Address"
              className={`rounded-xl bg-[#efeff5] ${errors.streetAddress ? 'border-red-500' : ''}`}
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
            />
            {errors.streetAddress && (
              <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Zip*
              {errors.zip && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Zip Code"
              className={`rounded-xl bg-[#efeff5] ${errors.zip ? 'border-red-500' : ''}`}
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
            />
            {errors.zip && (
              <p className="text-red-500 text-xs mt-1">{errors.zip}</p>
            )}
          </div>
        </div>

        {(!isEdit || editingAddressId) && (
          <Button
            type="primary"
            className="mt-4 bg-secondary rounded-xl flex items-center gap-2"
            onClick={handleAddAddress}
          >
            <Plus size={14} /> {editingAddressId ? 'Update Address' : 'Add Address'}
          </Button>
        )}
      </Card>

      {/* ================= SAVED LOCATIONS ================= */}
      {addresses.map((item, index) => (
        <Card key={item.id} className="rounded-xl">
          <div className="flex justify-between items-start">
            <h4 className="font-bold">Location {index + 1}</h4>

            <div className="flex gap-3 text-secondary">
              <Pencil
                size={16}
                className="cursor-pointer"
                onClick={() => handleEditAddress(item.id)}
              />
              <Trash2Icon
                size={16}
                className="cursor-pointer"
                onClick={() => handleDeleteAddress(item.id)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-4 text-sm">
            <div>
              <p className="text-gray-500">Time Zone</p>
              <p className="font-medium">{item.timeZone}</p>
            </div>

            <div>
              <p className="text-gray-500">Country</p>
              <p className="font-medium">{item.country}</p>
            </div>

            <div>
              <p className="text-gray-500">City</p>
              <p className="font-medium">{item.city}</p>
            </div>

            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-medium">{item.address}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
