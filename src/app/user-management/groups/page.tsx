'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

const DeleteConfirmModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

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

export default function GroupsListPage() {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: 'Departments',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Last modified',
      dataIndex: 'modified',
      key: 'modified',
    },
  ]

  const filters = {
    searchPlaceholder: "Search groups",
    dropdowns: [
      {
        label: 'All Company',
        items: [{ key: 'all', label: 'All Company' }]
      },
      {
        label: 'All Departments',
        items: [{ key: 'all', label: 'All Departments' }]
      },
      {
        label: 'All Groups',
        items: [{ key: 'all', label: 'All Groups' }]
      },
    ]
  }

  const handleCreate = () => {
    router.push('/user-management/groups/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/groups/${record.id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/groups/create?groupId=${record.id}`)
  }

  const handleDelete = (record: any) => {
    setDeleteOpen(true)
  }

  return (
    <>
      <ListPage
        title="Groups"
        description="Create and Manage Groups For Routing, Permissions and Collaboration."
        data={groups}
        columns={columns}
        filters={filters}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          // 🔥 call delete API here
        }}
      />
    </>
  )
}
