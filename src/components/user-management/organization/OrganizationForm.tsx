'use client'

import { useState, useEffect } from 'react'
import { Card, Input, Select, Button } from 'antd'
import { Plus, ChevronLeft, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'
import { useLocations } from '@/hooks/useLocations'

interface OrganizationFormData {
  organizationName: string // Renamed from 'name'
  email: string
  contactNumber: string
  description: string
  primaryAdmin?: string
  locations: string[] | any[] // Allow both string IDs and populated objects
  createdAt: string
}

interface OrganizationFormProps {
  isEdit?: boolean
  initialValues?: Partial<OrganizationFormData>
  onSubmit: (values: OrganizationFormData) => void
  onCancel: () => void
}

export default function OrganizationForm({
  isEdit = false,
  initialValues,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch users and locations for dropdowns
  const { users } = useUsers()
  const { locations } = useLocations({ autoFetch: true, fetchAll: true })

  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: '',
    email: '',
    contactNumber: '',
    description: '',
    primaryAdmin: '',
    locations: [],
    createdAt: new Date().toISOString(),
    ...initialValues,
  })

  // Format location display name
  const formatLocationDisplay = (location: any) => {
    return `${location.streetAddress}, ${location.city}, ${location.state || ''} ${location.zip}`.trim()
  }

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({ ...prev, ...initialValues }))
    }
  }, [initialValues])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number (digits, spaces, dashes, and parentheses only)'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    // primaryAdmin is now optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddLocation = () => {
    router.push('/user-management/locations/create')
  }

  const handleRemoveLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Convert locations back to IDs if they are objects
      const submissionData = {
        ...formData,
        locations: formData.locations.map(loc =>
          typeof loc === 'string' ? loc : loc.id || loc._id
        )
      }

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error - could show a toast or error message
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div onClick={() => router.back()} className="rounded-xl cursor-pointer flex items-center">
           <ChevronLeft size={18} className='text-secondary'/> Back
          </div>
        <div className="flex gap-3">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl text-secondary border-secondary">
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

      {/* ================= BASIC INFO ================= */}
      <Card className="rounded-xl">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium">
              Company Name *
              {errors.organizationName && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Enter Company Name"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              className={`rounded-xl bg-[#efeff5] ${errors.organizationName ? 'border-red-500' : ''}`}
            />
            {errors.organizationName && (
              <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Email ID *
              {errors.email && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`rounded-xl bg-[#efeff5] ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Contact Number *
              {errors.contactNumber && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Enter Contact Number"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              className={`rounded-xl bg-[#efeff5] ${errors.contactNumber ? 'border-red-500' : ''}`}
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">
            Description *
            {errors.description && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input.TextArea
            rows={3}
            placeholder="Enter Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`rounded-xl bg-[#efeff5] ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
      </Card>

      {/* ================= PRIMARY ADMIN ================= */}
      <Card className="rounded-xl">
        <h3 className="font-semibold mb-3">
          Primary Admin (Optional)
        </h3>
        <Select
          placeholder="Select Primary Admin"
          value={formData.primaryAdmin}
          onChange={(value) => handleInputChange('primaryAdmin', value)}
          className="w-full rounded-xl bg-[#efeff5]"
          allowClear
          options={users.map(user => ({
            label: `${user.firstName} ${user.lastName} (${user.email})`,
            value: user._id
          }))}
        />
      </Card>

      {/* ================= LOCATIONS ================= */}
      <Card className="rounded-xl">
        <h3 className="font-semibold mb-4">Locations</h3>

        <div className="flex items-center gap-3 mb-4">
          <Select
            placeholder="Select Location"
            className="w-[300px] rounded-xl bg-[#efeff5]"
            onChange={(value) => {
              if (value && !formData.locations.includes(value)) {
                handleInputChange('locations', [...formData.locations, value])
              }
            }}
            options={locations.map(location => ({
              label: formatLocationDisplay(location),
              value: location.id // Use location ID instead of address string
            }))}
          />
          <Button
            type="primary"
            className="bg-secondary rounded-xl flex items-center gap-2"
            onClick={handleAddLocation}
          >
            <Plus size={14} /> Add Custom
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {formData.locations.map((locationItem, idx) => {
            // Handle both string IDs (from dropdown) and populated objects (from edit)
            const location = typeof locationItem === 'string'
              ? locations.find(loc => loc.id === locationItem)
              : locationItem

            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 flex justify-between items-start"
              >
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium">
                    {location ? formatLocationDisplay(location) : 'Location not found'}
                  </p>
                </div>

                <Trash2Icon
                  size={16}
                  className="text-secondary cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveLocation(idx)}
                />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
