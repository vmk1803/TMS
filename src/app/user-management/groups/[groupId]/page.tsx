'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import GroupDetailsTab from './GroupDetailsTab'
import AssignedManagerTab from './AssignedManagerTab'
import AssignedUsersTab from './AssignedUsersTab'
import { useGroup } from '@/hooks/useGroups'

const getTabs = (group: any) => [
  { key: 'details', label: 'Group Details' },
  { key: 'manager', label: 'Assigned Manager' },
  { key: 'users', label: `Assigned Users (${group?.members?.length || 0})` },
]

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string

  // Fetch group data
  const { group, loading, error } = useGroup(groupId)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Group</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Group not found
  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Group Not Found</h2>
          <p className="text-gray-500 mb-4">The group you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/user-management/groups')}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
          >
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <TabContainer
      tabs={getTabs(group)}
      backRoute="/user-management/groups"
      editRoute={`/user-management/groups/create?groupId=${group.id || group._id}`}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <GroupDetailsTab group={group} />
          case 'manager':
            return <AssignedManagerTab managerId={group.manager._id} />
          case 'users':
            return <AssignedUsersTab groupId={groupId} memberIds={group.members.map(m => m._id)} />
          default:
            return <GroupDetailsTab group={group} />
        }
      }}
    </TabContainer>
  )
}
