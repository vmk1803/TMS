'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Button, Select, message, Tag } from 'antd'
import { ChevronLeft } from 'lucide-react'

const { TextArea } = Input

// Dummy data
const groups = [
  {
    id: 1,
    name: 'Support Agents',
    department: 'Support',
    manager: 'Sarah Johnson',
    users: ['Ethan Carter', 'Liam Johnson'],
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
]

const managerOptions = [
  'Sarah Johnson',
  'Michael Smith',
  'Emily Davis',
  'James Brown',
  'Olivia Wilson',
]

const departmentOptions = [
  'QA',
  'Marketing',
  'Sales',
  'Development',
  'Customer Support',
]

const userOptions = [
  'James Brown',
  'Olivia Wilson',
  'Ethan Carter',
  'Sophia Turner',
  'Liam Johnson',
]

export default function CreateGroupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId')
  const isEditMode = !!groupId

  const [groupName, setGroupName] = useState('')
  const [department, setDepartment] = useState('')
  const [manager, setManager] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditMode && groupId) {
      const group = groups.find(g => g.id === Number(groupId))
      if (group) {
        setGroupName(group.name)
        setDepartment(group.department)
        setManager(group.manager)
        setUsers(group.users)
        setDescription(group.description)
      }
    }
  }, [isEditMode, groupId])

  const handleSave = async () => {
    if (!groupName || !department || !manager) {
      message.error('Please fill all required fields')
      return
    }

    setLoading(true)
    await new Promise(res => setTimeout(res, 800))
    message.success(isEditMode ? 'Group updated successfully' : 'Group created successfully')
    router.push('/user-management/groups')
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
            <label className="text-sm font-medium">Group Name*</label>
            <Input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="mt-1 rounded-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Department*</label>
            <Select
              showSearch
              value={department}
              placeholder="Select"
              className="mt-1 w-full"
              options={departmentOptions.map(d => ({
                value: d,
                label: d,
              }))}
              onChange={setDepartment}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description*</label>
          <TextArea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 rounded-xl"
          />
        </div>

    
      </div>
          {/* Add Manager */}
        <div className="bg-white rounded-2xl border mx-6 my-4 p-6 space-y-6">
          <h3 className="text-sm font-semibold mb-3">Add Manager</h3>
          <div className="text-sm font-medium">Member*</div>
          <Select
            showSearch
            value={manager}
            placeholder="Select"
            className="mt-[10px] w-[300px]"
            options={managerOptions.map(m => ({
              value: m,
              label: m,
            }))}
            onChange={setManager}
          />
        </div>

        {/* Add Users */}
        <div className="bg-white rounded-2xl border mx-6 p-6 space-y-6">
          <h3 className="text-sm font-semibold mb-3">Add Users</h3>
          <div className="text-sm font-medium">Members*</div>

          <Select
            mode="multiple"
            showSearch
            value={users}
            placeholder="Select"
            className="mt-[10px] w-[300px]"
            options={userOptions.map(u => ({
              value: u,
              label: u,
            }))}
            maxTagCount={0}   // 🔑 hide chips inside input
            onChange={setUsers}
          />

          {/* Chips BELOW input */}
          {users.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {users.map(user => (
                <Tag
                  key={user}
                  closable
                  onClose={() =>
                    setUsers(prev => prev.filter(u => u !== user))
                  }
                >
                  {user}
                </Tag>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
