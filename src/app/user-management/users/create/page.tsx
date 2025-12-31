'use client'

import { ChevronLeft, Trash2Icon, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Dummy data options - key-value pairs for easy API integration
const genderOptions = [
  { key: 'male', value: 'Male' },
  { key: 'female', value: 'Female' },
  { key: 'other', value: 'Other' },
]

const roleOptions = [
  { key: 'admin', value: 'Admin' },
  { key: 'manager', value: 'Manager' },
  { key: 'user', value: 'User' },
]

const departmentOptions = [
  { key: 'operations', value: 'Operations' },
  { key: 'marketing', value: 'Marketing' },
  { key: 'sales', value: 'Sales' },
  { key: 'engineering', value: 'Engineering' },
]

const companyOptions = [
  { key: 'gold-wealth', value: 'Gold Wealth Partners' },
  { key: 'creative-minds', value: 'Creative Minds Inc.' },
  { key: 'bright-futures', value: 'Bright Futures LLC' },
  { key: 'tech-innovators', value: 'Tech Innovators Co.' },
]

const locationOptions = [
  { key: 'new-york', value: 'New York' },
  { key: 'san-francisco', value: 'San Francisco' },
  { key: 'london', value: 'London' },
  { key: 'tokyo', value: 'Tokyo' },
]

const reportingManagerOptions = [
  { key: 'sarah-johnson', value: 'Sarah Johnson' },
  { key: 'emily-davis', value: 'Emily Davis' },
  { key: 'michael-smith', value: 'Michael Smith' },
]

const passwordSettingsOptions = [
  { key: 'auto-generate', value: 'Auto Generate' },
  { key: 'manual', value: 'Manual' },
]

const userStatusOptions = [
  { key: 'active', value: 'Active' },
  { key: 'inactive', value: 'Inactive' },
]

const assetOptions = [
  { key: 'laptop', value: 'Laptop' },
  { key: 'desktop', value: 'Desktop' },
  { key: 'monitor', value: 'Monitor' },
  { key: 'keyboard', value: 'Keyboard' },
]

export default function CreateUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    role: '',
    department: '',
    company: '',
    location: '',
    reportingManager: '',
    passwordSettings: '',
    userStatus: '',
    assignAsset: false,
    assets: [{ assetType: '', assetId: '' }],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAssetChange = (index: number, field: string, value: string) => {
    const newAssets = [...formData.assets]
    newAssets[index] = { ...newAssets[index], [field]: value }
    if (field === 'assetType' && value) {
      // Auto generate asset ID
      newAssets[index].assetId = `AST-${Date.now()}-${index}`
    }
    setFormData(prev => ({ ...prev, assets: newAssets }))
  }

  const addAsset = () => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, { assetType: '', assetId: '' }]
    }))
  }

  const removeAsset = (index: number) => {
    if (formData.assets.length > 1) {
      setFormData(prev => ({
        ...prev,
        assets: prev.assets.filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'mobile', 'role', 'department', 'company', 'location', 'passwordSettings', 'userStatus'
    ]

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required'
      }
    })

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Mobile validation (basic)
    if (formData.mobile && !/^\+?\d{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number'
    }

    // Asset validation if assigned
    if (formData.assignAsset) {
      formData.assets.forEach((asset, index) => {
        if (!asset.assetType) {
          newErrors[`asset-${index}`] = 'Asset type is required'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      // Here you would typically make an API call
      console.log('Form data:', formData)
      // On success, redirect
      router.push('/user-management/users')
    }
  }

  const handleCancel = () => {
    router.push('/user-management/users')
  }

  return (
    <div className="p-6 bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex gap-3">
          <button onClick={handleCancel} className="px-5 py-2 rounded-2xl border border-secondary text-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-2xl bg-secondary text-white">
            Save
          </button>
        </div>
      </div>

      {/* Personal Details */}
      <Section title="Personal Details">
        <Input label="First Name*" placeholder="Enter First Name" value={formData.firstName} onChange={(value) => handleInputChange('firstName', value)} error={errors.firstName} />
        <Input label="Last Name*" placeholder="Enter Last Name" value={formData.lastName} onChange={(value) => handleInputChange('lastName', value)} error={errors.lastName} />
        <Input label="Email ID*" placeholder="Enter Email ID" value={formData.email} onChange={(value) => handleInputChange('email', value)} error={errors.email} />
        <Input label="Mobile Number*" placeholder="Enter Mobile Number" value={formData.mobile} onChange={(value) => handleInputChange('mobile', value)} error={errors.mobile} />
        <Select label="Gender" options={genderOptions} value={formData.gender} onChange={(value) => handleInputChange('gender', value)} />
      </Section>

      {/* Organizational Details */}
      <Section title="Organizational Details">
        <Select label="Role*" options={roleOptions} value={formData.role} onChange={(value) => handleInputChange('role', value)} error={errors.role} />
        <Select label="Department*" options={departmentOptions} value={formData.department} onChange={(value) => handleInputChange('department', value)} error={errors.department} />
        <Select label="Company*" options={companyOptions} value={formData.company} onChange={(value) => handleInputChange('company', value)} error={errors.company} />
        <Select label="Location*" options={locationOptions} value={formData.location} onChange={(value) => handleInputChange('location', value)} error={errors.location} />
        <Select label="Reporting Manager" options={reportingManagerOptions} value={formData.reportingManager} onChange={(value) => handleInputChange('reportingManager', value)} />
      </Section>

      {/* Account Settings */}
      <Section title="Account Settings">
        <Select label="Password Settings*" options={passwordSettingsOptions} value={formData.passwordSettings} onChange={(value) => handleInputChange('passwordSettings', value)} error={errors.passwordSettings} />
        <Select label="User Status*" options={userStatusOptions} value={formData.userStatus} onChange={(value) => handleInputChange('userStatus', value)} error={errors.userStatus} />
      </Section>

      {/* Asset Assignment */}
      <Section title="Asset Assignment (If applicable)">
        <div className='flex flex-col col-span-full'>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.assignAsset}
              onChange={(e) => handleInputChange('assignAsset', e.target.checked)}
            />
            <span className="text-sm">Assign Laptop/Desktop</span>
          </div>
          {formData.assignAsset && (
            <div>
              {formData.assets.map((asset, index) => (
                <div key={index} className="grid grid-cols-[200px_200px_40px_180px] gap-4 items-center mb-2">
                  <Select
                    label="Select Asset*"
                    options={assetOptions}
                    value={asset.assetType}
                    onChange={(value) => handleAssetChange(index, 'assetType', value)}
                    error={errors[`asset-${index}`]}
                  />
                  <Input
                    label="Asset ID"
                    placeholder="Auto Generate"
                    value={asset.assetId}
                    disabled
                  />
                  <button
                    onClick={() => removeAsset(index)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg"
                  >
                    <Trash2Icon size={16} />
                  </button>
                  {index === formData.assets.length - 1 && (
                    <button
                      onClick={addAsset}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-2xl text-sm"
                    >
                      <Plus size={16} /> Add More Asset
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}


function Section({ title, children }: any) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  )
}

function Input({ label, placeholder, disabled = false, value, onChange, error }: any) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <input
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full px-4 py-2 text-sm border rounded-full bg-gray-50 focus:outline-none ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Select({ label, options = [], value, onChange, error }: any) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full px-4 py-2 text-sm border rounded-full bg-gray-50 focus:outline-none ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="">Select</option>
        {options.map((option: any) => (
          <option key={option.key} value={option.key}>
            {option.value}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
