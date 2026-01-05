'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Button, Select, message, Tag } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useDepartments } from '@/hooks/useDepartments'
import { useUsers } from '@/hooks/useUsers'
import { useGroup, useGroups } from '@/hooks/useGroups'

const { TextArea } = Input

export default function CreateGroupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId')
  const isEditMode = !!groupId

  // API hooks
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })
  const { users: allUsers, loading: usersLoading } = useUsers({ fetchAll: true })
  const { group, loading: groupLoading } = useGroup(groupId)
  const { createGroup, updateGroup } = useGroups({ autoFetch: false })

  // Form state
  const [groupName, setGroupName] = useState('')
  const [department, setDepartment] = useState('')
  const [manager, setManager] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load group data for edit mode
  useEffect(() => {
    if (isEditMode && group) {
      setGroupName(group.name)
      setDepartment(group.department._id)
      setManager(group.manager._id)
      setSelectedUsers(group.members.map(member => member._id))
      setDescription(group.description || '')
    }
  }, [isEditMode, group])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required'
    }
    if (!department) {
      newErrors.department = 'Department is required'
    }
    if (!manager) {
      newErrors.manager = 'Manager is required'
    }
    if (!selectedUsers || selectedUsers.length === 0) {
      newErrors.users = 'At least one member is required'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      message.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const groupData = {
        name: groupName.trim(),
        department,
        manager,
        members: selectedUsers,
        description: description.trim() || undefined,
      }

      if (isEditMode && groupId) {
        await updateGroup(groupId, groupData)
        message.success('Group updated successfully')
      } else {
        await createGroup(groupData)
        message.success('Group created successfully')
      }

      router.push('/user-management/groups')
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Save group error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 mb-6">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft size={14} />
          <span className="text-sm text-gray-500">Back</span>        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.back()}>Cancel</Button>
          <Button
            type="primary"
            className="bg-secondary"
            loading={loading}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border mx-6 p-6 space-y-6">
        {/* Group Name + Department */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Group Name*
              {errors.groupName && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              value={groupName}
              onChange={e => {
                setGroupName(e.target.value)
                if (errors.groupName) {
                  setErrors(prev => ({ ...prev, groupName: '' }))
                }
              }}
              className={`mt-1 rounded-full ${errors.groupName ? 'border-red-500' : ''}`}
            />
            {errors.groupName && (
              <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Department*
              {errors.department && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select
              showSearch
              value={department}
              placeholder="Select department"
              className={`mt-1 w-full ${errors.department ? 'border-red-500' : ''}`}
              loading={departmentsLoading}
              options={departments.map(d => ({
                value: d._id,
                label: d.name,
              }))}
              onChange={(value) => {
                setDepartment(value)
                if (errors.department) {
                  setErrors(prev => ({ ...prev, department: '' }))
                }
              }}
            />
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">
            Description*
            {errors.description && <span className="text-red-500 ml-1">*</span>}
          </label>
          <TextArea
            rows={3}
            value={description}
            onChange={e => {
              setDescription(e.target.value)
              if (errors.description) {
                setErrors(prev => ({ ...prev, description: '' }))
              }
            }}
            className={`mt-1 rounded-xl ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>


      </div>
      {/* Add Manager */}
      <div className="bg-white rounded-2xl border mx-6 my-4 p-6 space-y-6">
        <h3 className="text-sm font-semibold mb-3">Add Manager</h3>
        <div className="text-sm font-medium">
          Member*
          {errors.manager && <span className="text-red-500 ml-1">*</span>}
        </div>
        <Select
          showSearch
          value={manager}
          placeholder="Select manager"
          className={`mt-[10px] w-[300px] ${errors.manager ? 'border-red-500' : ''}`}
          loading={usersLoading}
          options={allUsers.map(u => ({
            value: u._id,
            label: `${u.firstName} ${u.lastName}`,
          }))}
          onChange={(value) => {
            setManager(value)
            if (errors.manager) {
              setErrors(prev => ({ ...prev, manager: '' }))
            }
          }}
        />
        {errors.manager && (
          <p className="text-red-500 text-xs mt-1">{errors.manager}</p>
        )}
      </div>

      {/* Add Users */}
      <div className="bg-white rounded-2xl border mx-6 p-6 space-y-6">
        <h3 className="text-sm font-semibold mb-3">Add Users</h3>
        <div className="text-sm font-medium">
          Members*
          {errors.users && <span className="text-red-500 ml-1">*</span>}
        </div>

        <Select
          mode="multiple"
          showSearch
          value={selectedUsers}
          placeholder="Select members"
          className={`mt-[10px] w-[300px] ${errors.users ? 'border-red-500' : ''}`}
          loading={usersLoading}
          options={allUsers.map(u => ({
            value: u._id,
            label: `${u.firstName} ${u.lastName}`,
          }))}
          maxTagCount={0}   // 🔑 hide chips inside input
          onChange={(value) => {
            setSelectedUsers(value)
            if (errors.users) {
              setErrors(prev => ({ ...prev, users: '' }))
            }
          }}
        />
        {errors.users && (
          <p className="text-red-500 text-xs mt-1">{errors.users}</p>
        )}

        {/* Chips BELOW input */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedUsers.map(userId => {
              const user = allUsers.find(u => u._id === userId)
              return (
                <Tag
                  key={userId}
                  closable
                  onClose={() =>
                    setSelectedUsers(prev => prev.filter(id => id !== userId))
                  }
                >
                  {user ? `${user.firstName} ${user.lastName}` : userId}
                </Tag>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
