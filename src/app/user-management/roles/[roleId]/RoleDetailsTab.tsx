interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  userCount: number
  status: string
  createdDate: string
}

interface RoleDetailsTabProps {
  role?: Role
}

export default function RoleDetailsTab({ role }: RoleDetailsTabProps) {
  if (!role) {
    return <div className="text-center py-8">Role not found</div>
  }

  // Map permissions to modules (dummy mapping for demo)
  const getModulesFromPermissions = (permissions: string[]) => {
    const moduleMap: { [key: string]: string[] } = {
      'Projects': ['Create', 'Read', 'Update', 'Delete'],
      'Tasks': ['Create', 'Read', 'Update'],
      'Users': ['Read', 'Update', 'Manage Users'],
      'Settings': ['Create', 'Read', 'Update', 'Delete'],
    }

    const modules: string[] = []
    Object.keys(moduleMap).forEach(module => {
      const modulePerms = moduleMap[module]
      if (permissions.some(p => modulePerms.includes(p))) {
        modules.push(module)
      }
    })
    return modules
  }

  const assignedModules = getModulesFromPermissions(role.permissions)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left */}
      <div className="col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold text-secondary">{role.name}</h2>
          <p className="text-sm text-gray-500">
            {role.description} • Created on {role.createdDate}
          </p>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Assigned Modules</p>
            <div className="flex gap-2 flex-wrap">
              {assignedModules.map(m => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border">
          <h3 className="text-sm font-semibold mb-4">Role Permissions</h3>

          {[
            {
              title: 'General',
              perms: role.permissions
            },
          ].map(section => (
            <div key={section.title} className="mb-4">
              <p className="text-sm font-medium mb-2">{section.title}</p>
              <div className="flex gap-2 flex-wrap">
                {section.perms.map(p => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
                  <p className="text-gray-500">Created on {role.createdDate}</p>
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
                  <p className="font-medium">Status: {role.status}</p>
                  <p className="text-gray-500">Assigned to {role.userCount} users</p>
                </div>
              </div>

              {/* Step 3: Permissions Assigned (if applicable) */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                 <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Permissions Assigned</p>
                  <p className="text-gray-500">{role.permissions.length} permissions granted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
