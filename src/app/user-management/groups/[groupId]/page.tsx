'use client'

import { useParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import TabContainer, { HeaderAction } from '@/components/common/TabContainer'
import GroupDetailsTab from './GroupDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import { useGroup } from '@/hooks/useGroups'

const getTabs = (group: any) => [
  { key: 'details', label: 'Group Details' },
  { key: 'users', label: `Assigned Users (${group?.members?.length || 0})`, disbaled: !group?.members?.length },
]

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string

  // Refs for tab actions
  const assignedUsersTabRef = useRef<{
    handleRemove: () => void
    handleAddUser: () => void
  }>(null)

  // State for selected users count
  const [selectedUsersCount, setSelectedUsersCount] = useState(0)

  // Fetch group data
  const { group, loading, error, updateGroup } = useGroup(groupId)

  const getHeaderActions = (activeTab: string) => {
    switch (activeTab) {
      case 'users':
        const actions: HeaderAction[] = [
          {
            label: 'Remove',
            onClick: () => assignedUsersTabRef.current?.handleRemove(),
            type: 'default' as const,
            danger: true,
            disabled: selectedUsersCount === 0,
          }
        ]

        // Only show Add User button when no rows are selected
        if (selectedUsersCount === 0) {
          actions.push({
            label: 'Add Users',
            onClick: () => assignedUsersTabRef.current?.handleAddUser(),
            type: 'primary' as const,
          })
        }

        return actions
      case 'details':
        return [
          {
            label: 'Edit',
            onClick: () => router.push(`/user-management/groups/create?groupId=${group.id || group._id}`),
            type: 'primary' as const,
          },
        ]
      default:
        return []
    }
  }

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
          <p className="text-gray-500 mb-4">The group you&apos;re looking for doesn&apos;t exist.</p>
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
      showEditButton={false}
      getHeaderActions={getHeaderActions}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <GroupDetailsTab group={group} updateGroup={updateGroup} />
          case 'users':
            return <AssignedUsersTab
              ref={assignedUsersTabRef}
              groupId={groupId}
              memberIds={group.members.map(m => m._id)}
              group={group}
              onSelectionChange={setSelectedUsersCount}
            />
          default:
            return <GroupDetailsTab group={group} updateGroup={updateGroup} />
        }
      }}
    </TabContainer>
  )
}
