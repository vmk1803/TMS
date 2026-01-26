import { Table, Input } from 'antd'
import { Search, Eye } from 'lucide-react'
import { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useGroupMembers } from '@/hooks/useGroups'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'
import SearchableDropdown from '@/components/common/SearchableDropdown'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import Pagination from '@/components/common/Pagination'
import { useUsers } from '@/hooks/useUsers'
import { useGroup } from '@/hooks/useGroups'
import MultiSelectSearchable from '@/components/common/MultiSelectSearchable'

interface AssignedUsersTabProps {
  groupId: string
  memberIds: string[]
  group: any
  onSelectionChange?: (count: number) => void
}

export interface AssignedUsersTabRef {
  handleRemove: () => void
  handleAddUser: () => void
}

const AssignedUsersTab = forwardRef<AssignedUsersTabRef, AssignedUsersTabProps>(
  ({ groupId, memberIds, group, onSelectionChange }, ref) => {
    const router = useRouter()
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<string[]>([])

    // Search functionality
    const {
      searchQuery,
      setSearchQuery,
      debouncedSearchQuery,
      isDebouncing
    } = useDebouncedSearch({ debounceDelay: 1000 })

    // Departments for filter dropdown
    const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

    // Fetch all users for add user modal
    const { users: allUsers, loading: usersLoading } = useUsers({ fetchAll: true })

    // Group hook for updating
    const { updateGroup } = useGroup(groupId)

    // Fetch group members using the new efficient API
    const {
      members,
      loading: membersLoading,
      error: membersError,
      pagination,
      refetch: refetchMembers
    } = useGroupMembers(groupId, {
      page: currentPage,
      pageSize: itemsPerPage,
      searchString: debouncedSearchQuery,
      department: selectedDepartment === 'all' ? undefined : selectedDepartment,
      status: selectedStatus === 'all' ? undefined : selectedStatus
    })

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      handleRemove: () => {
        if (selectedUsers.length === 0) return
        setShowRemoveModal(true)
      },
      handleAddUser: () => {
        setShowAddUserModal(true)
      }
    }))

    // Notify parent of selection changes
    useEffect(() => {
      onSelectionChange?.(selectedUsers.length)
    }, [selectedUsers.length, onSelectionChange])

    const handleRemoveUsers = async () => {
      if (!group || selectedUsers.length === 0) return

      const updatedMembers = memberIds.filter(id => !selectedUsers.includes(id))
      const success = await updateGroup({ members: updatedMembers })

      if (success) {
        setSelectedUsers([])
        refetchMembers()
        setShowRemoveModal(false)
      }
    }

    const handleAddUsers = async () => {
      if (!group || selectedUsersToAdd.length === 0) return

      const updatedMembers = [...memberIds, ...selectedUsersToAdd]
      const success = await updateGroup({ members: updatedMembers })

      if (success) {
        setSelectedUsersToAdd([])
        refetchMembers()
        setShowAddUserModal(false)
      }
    }

    const userOptions = useMemo(() => {
      return allUsers.map(user => ({
        label: `${user.firstName} ${user.lastName} (${user.email})`,
        value: user._id
      })).filter((user) => {
        return !members.some(member => member._id === user.value)
      })
    }, [allUsers, members])

    const displayedMemberIds = useMemo(() => members.map((m: any) => m._id), [members])
    console.log("🚀 ~ displayedMemberIds:", displayedMemberIds)
    const selectedDisplayedMemberIds = useMemo(
      () => selectedUsers.filter(id => displayedMemberIds.includes(id)),
      [selectedUsers, displayedMemberIds]
    )

    console.log(selectedUsers, 'selectedDisplayedMemberIds')

    const isAllDisplayedSelected =
      displayedMemberIds.length > 0 && selectedDisplayedMemberIds.length === displayedMemberIds.length
    const isSomeDisplayedSelected =
      selectedDisplayedMemberIds.length > 0 && selectedDisplayedMemberIds.length < displayedMemberIds.length

    const toggleSelectAllDisplayed = (checked: boolean) => {
      if (checked) {
        setSelectedUsers(prev => Array.from(new Set([...prev, ...displayedMemberIds])))
      } else {
        setSelectedUsers(prev => prev.filter(id => !displayedMemberIds.includes(id)))
      }
    }

    const columns = [
      {
        title: (
          <input
            type="checkbox"
            checked={isAllDisplayedSelected}
            ref={(el) => {
              if (el) el.indeterminate = isSomeDisplayedSelected
            }}
            onChange={(e) => toggleSelectAllDisplayed(e.target.checked)}
            aria-label="Select all rows"
          />
        ),
        render: (text: string, record: any) => (
          <input
            type="checkbox"
            checked={selectedUsers.includes(record._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers(prev => [...prev, record._id])
              } else {
                setSelectedUsers(prev => prev.filter(id => id !== record._id))
              }
            }}
            aria-label={`Select ${record.firstName} ${record.lastName}`}
          />
        )
      },
      {
        title: 'Name', dataIndex: 'name',
        render: (text: string, record: any) => `${record.firstName} ${record.lastName}`
      },
      { title: 'Mobile Number', dataIndex: 'mobileNumber' },
      { title: 'Email ID', dataIndex: 'email' },
      {
        title: 'Organization', dataIndex: 'organization',
        render: (org: any) => org?.organizationName || 'N/A'
      },
      {
        title: 'Role', dataIndex: 'role',
        render: (role: any) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${role?.name === 'Admin'
              ? 'bg-blue-100 text-blue-700'
              : role?.name === 'Manager'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}
          >
            {role?.name || 'N/A'}
          </span>
        ),
      },
      {
        title: 'Department', dataIndex: 'department',
        render: (dept: any) => dept?.name || 'N/A'
      },
      {
        title: 'Last Login', dataIndex: 'lastLogin',
        render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never'
      },
      {
        title: 'Status',
        dataIndex: 'active',
        render: (active: boolean) => (
          <span className={`px-3 py-1 rounded-full text-xs ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        title: 'Actions',
        render: (text: string, record: any) => (
          <Eye
            size={16}
            className="cursor-pointer text-secondary hover:text-secondary/80"
            onClick={() => router.push(`/user-management/users/${record._id}`)}
          />
        ),
      },
    ]

    const departmentFilterItems = [
      { key: 'all', label: 'All Departments' },
      ...departments.map(dept => ({
        key: dept._id,
        label: dept.name
      }))
    ]

    const statusFilterItems = [
      { key: 'all', label: 'All Status' },
      { key: 'true', label: 'Active' },
      { key: 'false', label: 'Inactive' }
    ]

    if (membersError) {
      return (
        <div className="bg-white rounded-2xl border p-6">
          <div className="text-center text-red-600">
            Error loading members: {membersError}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl border">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="relative w-[30%]">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              <Search size={16} />
            </div>
            <Input
              placeholder="Search members"
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isDebouncing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <SearchableDropdown
              label={
                selectedDepartment === 'all'
                  ? 'All Departments'
                  : departments.find(d => d._id === selectedDepartment)?.name || 'All Departments'
              }
              items={departmentFilterItems}
              onClick={({ key }) => {
                setSelectedDepartment(key)
                setCurrentPage(1) // Reset to first page when filtering
              }}
            />
            <SearchableDropdown
              label={
                selectedStatus === 'all'
                  ? 'All Status'
                  : selectedStatus === 'true' ? 'Active' : 'Inactive'
              }
              items={statusFilterItems}
              onClick={({ key }) => {
                setSelectedStatus(key)
                setCurrentPage(1) // Reset to first page when filtering
              }}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={members}
          pagination={false}
          rowKey="_id"
          loading={membersLoading}
          scroll={{ x: 'max-content' }}
        />

        {pagination && (
          <Pagination
            page={currentPage}
            pageSize={itemsPerPage}
            totalItems={pagination.total_records}
            onPageChange={setCurrentPage}
            onPageSizeChange={setItemsPerPage}
            maxPageButtons={3}
            resetPageOnPageSizeChange
            clampPageToRange
          />
        )}

        {/* Remove Confirmation Modal */}
        <ConfirmationModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={handleRemoveUsers}
          title="Remove Users"
          body={`Are you sure you want to remove ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} from this group?`}
          confirmText="Remove"
          cancelText="Cancel"
        />

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
            <div className="bg-white w-[95%] md:w-[600px] rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC] border-b border-[#DDE2E5]">
                <h2 className="text-lg font-semibold text-primaryText">Add Users to Group</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-600 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <MultiSelectSearchable
                  label="Select Users"
                  value={selectedUsersToAdd}
                  options={userOptions}
                  onChange={setSelectedUsersToAdd}
                  placeholder="Search and select users to add..."
                />

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUsers}
                    disabled={selectedUsersToAdd.length === 0}
                    className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  })

AssignedUsersTab.displayName = 'AssignedUsersTab'

export default AssignedUsersTab
