'use client'

import { Card, Input, Select, Button, message } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useUsers } from '@/hooks/useUsers'
import { useDepartments, useDepartment } from '@/hooks/useDepartments'

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
    organization: '',
    headOfDepartment: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)

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
        organization: department.organization?._id || '',
        headOfDepartment: department.headOfDepartment?._id || '',
        status: department.status || 'active'
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

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!values.name.trim()) {
      message.error('Department name is required')
      return
    }
    if (!values.organization) {
      message.error('Organization is required')
      return
    }

    setLoading(true)
    try {
      if (departmentId) {
        // Update department
        await updateDepartment(departmentId, {
          name: values.name,
          organization: values.organization,
          headOfDepartment: values.headOfDepartment,
          status: values.status
        })
        message.success('Department updated successfully')
      } else {
        // Create department
        await createDepartment({
          name: values.name,
          organization: values.organization,
          headOfDepartment: values.headOfDepartment,
          status: values.status
        })
        message.success('Department created successfully')
      }
      router.push('/user-management/departments')
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setLoading(false)
    }
  }, [departmentId, values, createDepartment, updateDepartment, router])

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
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      <Card className="rounded-xl">
        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium">Department Name *</label>
            <Input
              placeholder="Enter Department Name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="bg-[#e5e7eb] rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Organization *</label>
            <Select
              placeholder="Select Organization"
              value={values.organization || undefined}
              onChange={(value) => setValues({ ...values, organization: value })}
              className="w-full bg-[#e5e7eb] rounded-xl"
              options={organizationOptions}
              loading={!organizations.length}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={values.status}
              onChange={(value) => setValues({ ...values, status: value })}
              className="w-full bg-[#e5e7eb] rounded-xl"
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Head of Department */}
      <Card className="mt-6 bg-white rounded-lg">
        <h3 className="text-sm font-semibold mb-3">Head of Department</h3>

        <label className="text-sm font-medium">Member</label>
        <Select
          placeholder="Select Head of Department"
          value={values.headOfDepartment || undefined}
          onChange={(value) => setValues({ ...values, headOfDepartment: value })}
          className="w-full bg-[#e5e7eb] rounded-xl mt-1"
          options={userOptions}
          loading={!users.length}
        />
      </Card>
    </>
  )
})

export default DepartmentForm
