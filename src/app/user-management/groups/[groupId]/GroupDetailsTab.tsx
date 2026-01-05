interface Group {
  id: number
  name: string
  manager: string
  members: string
  department: string
  type: string
  modified: string
}

interface GroupDetailsTabProps {
  group?: Group
}

export default function GroupDetailsTab({ group }: GroupDetailsTabProps) {
  if (!group) {
    return <div className="text-center py-8">Group not found</div>
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white rounded-2xl p-6 border">
        <h2 className="text-lg font-semibold text-secondary">
          {group.name}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {group.type} group managed by {group.manager} with {group.members} members.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Manager</p>
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
              {group.manager}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Department</p>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
              {group.department}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Group Type</p>
          <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
            {group.type}
          </span>
        </div>
      </div>

      <div className="bg-[#F1FAF7] rounded-2xl p-6 border">
        <h3 className="text-sm font-semibold mb-6">Activity Logs</h3>

        <div className="space-y-6">
          {/* Stepper with colored dots */}
          <div className="relative">
            {/* Connecting lines */}
            <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-gray-200"></div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1: Group Created */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-secondary">Group Created</p>
                  <p className="text-gray-500">Created on {group.modified}</p>
                </div>
              </div>

              {/* Step 2: Manager Assigned */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Manager Assigned</p>
                  <p className="text-gray-500">{group.manager} assigned as manager</p>
                </div>
              </div>

              {/* Step 3: Members Added */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-600">Members Added</p>
                  <p className="text-gray-500">{group.members} members added to group</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
