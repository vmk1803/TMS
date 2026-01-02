'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Checkbox, Button, message } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useRoles, useRole } from '@/hooks/useRoles'

// Permissions config matching our backend schema
const permissionsConfig = {
  Projects: ['CREATE', 'EDIT', 'VIEW', 'DELETE', 'EXPORT', 'UPDATE'],
  Task: ['CREATE', 'EDIT', 'VIEW', 'DELETE', 'EXPORT', 'UPDATE'],
  Users: ['CREATE', 'EDIT', 'VIEW', 'DELETE', 'EXPORT', 'UPDATE'],
  Settings: ['CREATE', 'EDIT', 'VIEW', 'DELETE', 'EXPORT', 'UPDATE'],
}

export default function CreateRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get('roleId')
  const isEditMode = !!roleId

  // Use hooks for API integration
  const { createRole, updateRole } = useRoles()
  const { role: existingRole, loading: roleLoading, error: roleError } = useRole(roleId || null)

  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load role data if in edit mode
  useEffect(() => {
    if (isEditMode && existingRole) {
      setRoleName(existingRole.name)
      setDescription(existingRole.description || '')

      // Convert backend permissions format to frontend format
      const frontendPermissions: Record<string, string[]> = {
        Projects: existingRole.permissions.projects || [],
        Task: existingRole.permissions.task || [],
        Users: existingRole.permissions.users || [],
        Settings: existingRole.permissions.settings || []
      }

      setPermissions(frontendPermissions)
    }
  }, [isEditMode, existingRole])

  // Show error if failed to load role in edit mode
  useEffect(() => {
    if (roleError) {
      message.error('Failed to load role data')
    }
  }, [roleError])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!roleName.trim()) {
      newErrors.name = 'Role name is required'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    // Check if at least one section has permissions
    const hasPermissions = Object.values(permissions).some(sectionPerms => sectionPerms.length > 0)
    if (!hasPermissions) {
      newErrors.permissions = 'At least one permission must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Transform frontend permissions to backend format
      const backendPermissions = {
        projects: permissions.Projects || [],
        task: permissions.Task || [],
        users: permissions.Users || [],
        settings: permissions.Settings || []
      }

      const roleData = {
        name: roleName.trim(),
        description: description.trim(),
        permissions: backendPermissions
      }

      if (isEditMode && roleId) {
        await updateRole(roleId, roleData)
        message.success('Role updated successfully')
      } else {
        await createRole(roleData)
        message.success('Role created successfully')
      }

      // Redirect back to roles page
      router.push('/user-management/roles')
    } catch (error) {
      console.error('Role submission error:', error)
      message.error('Failed to save role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/user-management/roles')
  }

  const togglePermission = (module: string, perm: string) => {
    setPermissions(prev => {
      const current = prev[module] || []
      const updated = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm]

      // Clear permission error when user selects a permission
      if (errors.permissions && updated.length > 0) {
        setErrors(prev => ({ ...prev, permissions: '' }))
      }

      return {
        ...prev,
        [module]: updated,
      }
    })
  }

  const toggleSelectAll = (module: string) => {
    setPermissions(prev => ({
      ...prev,
      [module]: prev[module]?.length === permissionsConfig[module].length
        ? []
        : [...permissionsConfig[module]],
    }))
  }

  const isChecked = (module: string, perm: string) =>
    permissions[module]?.includes(perm)

  if (roleLoading && isEditMode) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-secondary/80"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCancel} disabled={loading} className='rounded-xl'>Cancel</Button>
          <Button
            type="primary"
            className="bg-secondary rounded-xl"
            onClick={handleSubmit}
            loading={loading}
          >
            {isEditMode ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 border">
        {/* Role Name */}
        <div className="mb-4">
          <label className="text-sm font-medium">Role Name*</label>
          <Input
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value)
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
            }}
            placeholder="Enter role name"
            className={`mt-1 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm font-medium">Description*</label>
          <Input.TextArea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
            }}
            placeholder="Enter description"
            rows={3}
            className={`mt-1 rounded-xl ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Permissions */}
        <div>
          <h3 className="text-md font-bold mb-4">Role Permissions</h3>

          {errors.permissions && (
            <p className="text-red-500 text-xs mb-4">{errors.permissions}</p>
          )}

          <div className="grid grid-cols-8 px-2 text-sm font-medium text-gray-500 mb-2">
            <div className='text-secondary'>Section</div>
            <div className='text-secondary px-2 col-span-7'>Permissions</div>
          </div>

          {Object.entries(permissionsConfig).map(([module, perms]) => (
            <div
              key={module}
              className="grid grid-cols-8 items-center p-3 border-t"
            >
              <div className="font-medium">{module}</div>

              <div className="col-span-7 flex flex-wrap gap-2">
                <Checkbox
                  checked={permissions[module]?.length === perms.length}
                  onChange={() => toggleSelectAll(module)}
                  className='mr-2'
                >
                  Select All
                </Checkbox>

                {perms.map(perm => (
                  <Checkbox
                    key={perm}
                    checked={isChecked(module, perm)}
                    onChange={() => togglePermission(module, perm)}
                  >
                    {perm}
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
