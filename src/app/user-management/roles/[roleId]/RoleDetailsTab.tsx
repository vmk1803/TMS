import { Role } from '@/services/roleService'

interface RoleDetailsTabProps {
  role: Role
}

export default function RoleDetailsTab({ role }: RoleDetailsTabProps) {
  if (!role) {
    return <div className="text-center py-8">Role not found</div>
  }

  const createdByUser = role.createdBy && typeof role.createdBy === 'object' ? role.createdBy : null
  const createdByName = [createdByUser?.firstName, createdByUser?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const createdByLabel = createdByName || 'System'

  // Get permission sections that have permissions assigned
  const getPermissionSections = () => {
    const sections = [
      { name: 'Projects', permissions: role.permissions.projects },
      { name: 'Task', permissions: role.permissions.task },
      { name: 'Users', permissions: role.permissions.users },
      { name: 'Settings', permissions: role.permissions.settings }
    ]

    return sections.filter(section => section.permissions.length > 0)
  }

  const permissionSections = getPermissionSections()

  // Calculate total permissions count
  const totalPermissions = Object.values(role.permissions).reduce(
    (total, sectionPerms) => total + sectionPerms.length,
    0
  )

  // Format created date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left */}
      <div className="col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold text-secondary">{role.name}</h2>
          <p className="text-sm text-gray-500">
            {role.description || 'No description'} • Created by {createdByLabel}
          </p>
          
          <hr className='my-4' />

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Assigned Modules</p>
            <div className="flex gap-2 flex-wrap">
              {permissionSections.map(section => (
                <span
                  key={section.name}
                  className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                >
                  {section.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border">
          <h3 className="text-sm font-semibold mb-4">Role Permissions</h3>

          {permissionSections.length === 0 ? (
            <p className="text-sm text-gray-500">No permissions assigned</p>
          ) : (
            permissionSections.map(section => (
              <div key={section.name} className="mb-4 last:mb-0">
                <p className="text-sm font-medium mb-2">{section.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {section.permissions.map(permission => (
                    <span
                      key={permission}
                      className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right */}
      <div className="bg-[#F1FAF7] rounded-2xl p-6 border">
        <h3 className="text-sm font-semibold mb-6">Activity Logs</h3>

        <div className="space-y-6">
          {/* Stepper with colored dots */}
          <div className="relative">
            {/* Connecting lines */}
            <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-gray-200"></div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1: Role Created */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-secondary">Role Created</p>
                  <p className="text-gray-500">Created on {formatDate(role.createdAt)}</p>
                </div>
              </div>

              {/* Step 2: Status Update */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Status: Active</p>
                  <p className="text-gray-500">Assigned to 0 users</p>
                </div>
              </div>

              {/* Step 3: Permissions Assigned */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Permissions Assigned</p>
                  <p className="text-gray-500">{totalPermissions} permissions granted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
