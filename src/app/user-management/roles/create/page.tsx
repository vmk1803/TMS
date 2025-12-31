'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Checkbox, Button, message } from 'antd'

// Dummy roles data (same as in roles page)
const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access with all permissions',
    modules: 'All modules',
    permissions: ['View', 'Create', 'Edit', '+3 More'],
    users: 10,
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Department-level management access',
    modules: 'Users, Tasks, Projects',
    permissions: ['Read', 'Update', 'Assign', 'View Reports'],
    users: 10,
  },
  {
    id: 3,
    name: 'User',
    description: 'Standard user access',
    modules: 'Profile, Tasks',
    permissions: ['Read (self)', 'Update (self)', '+2 More'],
    users: 10,
  },
  {
    id: 4,
    name: 'Service Desk Agent',
    description: 'Department-level management access',
    modules: 'Tickets, SLA, Assets',
    permissions: ['Ticket Read', 'Ticket Update', 'Asset View'],
    users: 10,
  },
  {
    id: 5,
    name: 'Asset Manager',
    description: 'Department-level management access',
    modules: 'Asset Inventory',
    permissions: ['Asset Create', 'Asset Assign', 'Asset Delete'],
    users: 10,
  },
]

const permissionsConfig = {
  Projects: ['Create', 'Edit', 'View', 'Delete', 'Export', 'Update'],
  Task: ['Create', 'Edit', 'View', 'Delete'],
  Users: ['Create', 'Edit', 'View', 'Delete', 'Export', 'Update'],
  Settings: ['Create', 'Edit', 'View', 'Delete', 'Export', 'Update'],
}

export default function CreateRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get('roleId')
  const isEditMode = !!roleId

  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  // Load role data if in edit mode
  useEffect(() => {
    if (isEditMode && roleId) {
      const role = roles.find(r => r.id === parseInt(roleId))
      if (role) {
        setRoleName(role.name)
        setDescription(role.description)
        // Convert permissions array to object format for the form
        // For demo purposes, we'll set some default permissions
        setPermissions({
          Projects: ['Create', 'Edit', 'View', 'Delete', 'Export', 'Update'],
          Task: ['Create', 'Edit', 'View', 'Delete'],
          Users: ['View', 'Update'],
          Settings: ['Create', 'Edit', 'View', 'Delete', 'Export', 'Update'],
        })
      }
    }
  }, [isEditMode, roleId])

  const handleSubmit = async () => {
    if (!roleName.trim() || !description.trim()) {
      message.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (isEditMode) {
        message.success('Role updated successfully')
      } else {
        message.success('Role created successfully')
      }

      // Redirect back to roles page
      router.push('/user-management/roles')
    } catch (error) {
      message.error('An error occurred. Please try again.')
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
      return {
        ...prev,
        [module]: current.includes(perm)
          ? current.filter(p => p !== perm)
          : [...current, perm],
      }
    })
  }

  const toggleSelectAll = (module: string) => {
    setPermissions(prev => ({
      ...prev,
      [module]:
        prev[module]?.length === permissionsConfig[module].length
          ? []
          : permissionsConfig[module],
    }))
  }

  const isChecked = (module: string, perm: string) =>
    permissions[module]?.includes(perm)

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Role' : 'Create New Role'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode ? 'Update role details and permissions' : 'Add a new role with specific permissions'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCancel} className='rounded-xl'>Cancel</Button>
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
            onChange={e => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className="mt-1 rounded-xl"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm font-medium">Description*</label>
          <Input.TextArea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="mt-1 rounded-xl"
          />
        </div>

        {/* Permissions */}
        <div>
          <h3 className="text-md font-bold mb-4">Role Permissions</h3>

          <div className="grid grid-cols-10 px-2 text-sm font-medium text-gray-500 mb-2">
            <div className='text-secondary'>Name</div>
            <div className='text-secondary px-2'>Access</div>
            
          </div>

          {Object.entries(permissionsConfig).map(([module, perms]) => (
            <div
              key={module}
              className="grid grid-cols-10 items-center p-2 border-t"
            >
              <div className="font-medium">{module}</div>

              <Checkbox
                checked={permissions[module]?.length === perms.length}
                onChange={() => toggleSelectAll(module)}
                className='px-2'
              > Select All
                </Checkbox>

              {perms.map(perm => (
                <Checkbox
                  key={perm}
                   className='px-2'
                  checked={isChecked(module, perm)}
                  onChange={() => togglePermission(module, perm)}
                >
                  {perm}
                </Checkbox>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
