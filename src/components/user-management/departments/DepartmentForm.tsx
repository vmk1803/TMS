'use client'

import { Card, Input, Select, Button } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useUsers } from '@/hooks/useUsers'
import { useDepartments, useDepartment } from '@/hooks/useDepartments'

const DEPARTMENT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s&'().-]*$/

const DepartmentForm = memo(function DepartmentForm({
  title,
}: {
  title: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const departmentId = searchParams.get('departmentId')

  const [values, setValues] = useState({
    name: '',
    description: '',
    organization: '',
    headOfDepartment: ''
  })
  const [originalValues, setOriginalValues] = useState({
    name: '',
    description: '',
    organization: '',
    headOfDepartment: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Hooks for data fetching
  const { organizations } = useOrganizations({ autoFetch: true, fetchAll: true })
  const { users } = useUsers()
  const { createDepartment, updateDepartment } = useDepartments({ autoFetch: false })
  const { department, loading: departmentLoading } = useDepartment(departmentId || null)

  // Load department data for editing
  useEffect(() => {
    if (departmentId && department) {
      setValues({
        name: department.name || '',
        description: department.description || '',
        organization: department.organization?._id || '',
        headOfDepartment: department.headOfDepartment?._id || ''
      })
    }
  }, [departmentId, department])

  const organizationOptions = useMemo(() => {
    return organizations.map(org => ({
      value: org._id,
      label: org.organizationName
    }))
  }, [organizations])

  const userOptions = useMemo(() => {
    return users.map(user => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName} (${user.email})`
    }))
  }, [users])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    const trimmedName = values.name.trim()
    const trimmedDescription = values.description.trim()

    if (!trimmedName) {
      newErrors.name = 'Department name is required'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Department name must be at least 2 characters'
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Department name must be 100 characters or less'
    } else if (!DEPARTMENT_NAME_PATTERN.test(trimmedName)) {
      newErrors.name = "Department name contains invalid characters"
    }

    if (!values.organization) {
      newErrors.organization = 'Organization is required'
    }

    if (!trimmedDescription) {
      newErrors.description = 'Description is required'
    }

    if (!values.headOfDepartment) {
      newErrors.headOfDepartment = 'Head of Department is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values])

  const isNameValid = useMemo(() => {
    const trimmedName = values.name.trim()
    return (
      !!trimmedName &&
      trimmedName.length >= 2 &&
      trimmedName.length <= 100 &&
      DEPARTMENT_NAME_PATTERN.test(trimmedName)
    )
  }, [values.name])

  const isSaveDisabled = useMemo(() => {
    return (
      loading ||
      departmentLoading ||
      !isNameValid ||
      !values.organization ||
      !values.description.trim() ||
      !values.headOfDepartment
    )
  }, [loading, departmentLoading, isNameValid, values.organization, values.description, values.headOfDepartment])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      if (departmentId) {
        // Update department
        await updateDepartment(departmentId, {
          name: values.name,
          description: values.description,
          organization: values.organization,
          headOfDepartment: values.headOfDepartment,
        })
      } else {
        // Create department
        await createDepartment({
          name: values.name,
          description: values.description,
          organization: values.organization,
          headOfDepartment: values.headOfDepartment,
        })
      }
      router.push('/user-management/departments')
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setLoading(false)
    }
  }, [departmentId, values, createDepartment, updateDepartment, router, validateForm])

  const handleCancel = useCallback(() => {
    router.back()
  }, [router])

  const isEdit = useMemo(() => !!departmentId, [departmentId])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div onClick={() => router.back()} className='cursor-pointer flex items-center'>
          <ChevronLeft size={16} /> <span>Back</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCancel} disabled={loading}>Cancel</Button>
          <Button
            type="primary"
            className='bg-secondary'
            onClick={handleSubmit}
            loading={loading}
            disabled={isSaveDisabled}
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      <Card className="rounded-xl">
        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Department Name *
              {errors.name && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              placeholder="Enter Department Name"
              value={values.name}
              onChange={(e) => {
                setValues({ ...values, name: e.target.value })
                clearFieldError('name')
              }}
              status={errors.name ? 'error' : undefined}
              className={`bg-[#e5e7eb] rounded-xl ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Organization *
              {errors.organization && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select
              placeholder="Select Organization"
              value={values.organization || undefined}
              onChange={(value) => {
                setValues({ ...values, organization: value })
                clearFieldError('organization')
              }}
              className="w-full bg-[#e5e7eb] rounded-xl"
              options={organizationOptions}
              loading={!organizations.length}
              status={errors.organization ? 'error' : undefined}
            />
            {errors.organization && (
              <p className="text-red-500 text-xs mt-1">{errors.organization}</p>
            )}
          </div>

          <div className='col-span-2'>
            <label className="text-sm font-medium">
              Description *
              {errors.description && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input.TextArea
              placeholder="Enter Description"
              value={values.description}
              onChange={(e) => {
                setValues({ ...values, description: e.target.value })
                clearFieldError('description')
              }}
              status={errors.description ? 'error' : undefined}
              className={`bg-[#e5e7eb] rounded-xl ${errors.description ? 'border-red-500' : ''}`}
              autoSize={{ minRows: 1, maxRows: 3 }}
            />

            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

        </div>
      </Card>

      {/* Head of Department */}
      <Card className="mt-6 bg-white rounded-lg">
        <h3 className="text-sm font-semibold mb-3">Head of Department *</h3>

        <label className="text-sm font-medium">Member</label>
        <Select
          placeholder="Select Head of Department"
          value={values.headOfDepartment || undefined}
          onChange={(value) => {
            setValues({ ...values, headOfDepartment: value })
            clearFieldError('headOfDepartment')
          }}
          className="w-full bg-[#e5e7eb] rounded-xl mt-1"
          options={userOptions}
          loading={!users.length}
          status={errors.headOfDepartment ? 'error' : undefined}
        />
        {errors.headOfDepartment && (
          <p className="text-red-500 text-xs mt-1">{errors.headOfDepartment}</p>
        )}
      </Card>
    </>
  )
})

export default DepartmentForm
