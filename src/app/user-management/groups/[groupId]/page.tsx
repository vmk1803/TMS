'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import GroupDetailsTab from './GroupDetailsTab'
import AssignedManagerTab from './AssignedManagerTab'
import AssignedUsersTab from '../../roles/[roleId]/AssignedUsersTab'

const getTabs = (group: any) => [
  { key: 'details', label: 'Group Details' },
  { key: 'manager', label: 'Assigned Manager' },
  { key: 'users', label: `Assigned Users (${group?.members || 0})` },
]

// Dummy groups data (same as in groups page)
const groups = [
  {
    id: 1,
    name: 'Support Agents',
    manager: 'Sarah Johnson',
    members: '21+',
    department: 'Support',
    type: 'Task',
    modified: '2024-09-01',
  },
  {
    id: 2,
    name: 'On-call Engineers',
    manager: 'Michael Smith',
    members: '260',
    department: 'Engineering',
    type: 'Project',
    modified: '2024-09-01',
  },
  {
    id: 3,
    name: 'HR Approvers',
    manager: 'David Brown',
    members: '192',
    department: 'HR',
    type: 'Functional',
    modified: '2024-09-01',
  },
]

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = parseInt(params.groupId as string)
  const group = groups.find(g => g.id === groupId)

  if (!group) {
    return <div className="text-center py-8">Group not found</div>
  }

  return (
    <TabContainer
      tabs={getTabs(group)}
      backRoute="/user-management/groups"
      editRoute={`/user-management/groups/create?groupId=${groupId}`}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <GroupDetailsTab group={group} />
          case 'manager':
            return <AssignedManagerTab />
          case 'users':
            return <AssignedUsersTab />
          default:
            return <GroupDetailsTab group={group} />
        }
      }}
    </TabContainer>
  )
}
