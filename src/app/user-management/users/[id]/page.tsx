'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { message } from 'antd'
import { Mail, Phone, Calendar, User2 } from 'lucide-react'
import { useUser } from '../../../../hooks/useUser'
import { userApi } from '../../../../services/userService'
import AssignmentModal from '../AssignmentModal'
import ConfirmationModal from '../../../../components/common/ConfirmationModal'
import TabContainer from '../../../../components/common/TabContainer'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { user, loading, error, refetch } = useUser(userId)
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    type: 'role' | 'department' | null;
  }>({ isOpen: false, type: null });
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [statusChangeModal, setStatusChangeModal] = useState(false);
  const [statusChangeType, setStatusChangeType] = useState<'activate' | 'deactivate' | null>(null);

  const handleEdit = () => {
    router.push(`/user-management/users/create?userId=${userId}`)
  }

  const handleAssignRole = () => {
    setAssignmentModal({ isOpen: true, type: 'role' });
  }

  const handleAssignDepartment = () => {
    setAssignmentModal({ isOpen: true, type: 'department' });
  }

  const handleAssignmentConfirm = async (id: string) => {
    try {
      const updateData = assignmentModal.type === 'role'
        ? { role: id }
        : { department: id };

      await userApi.updateUser(userId, {
        organizationDetails: {
          role: user?.organizationDetails?.role?._id || user?.organizationDetails?.role,
          department: user?.organizationDetails?.department?._id || user?.organizationDetails?.department,
          organization: user?.organizationDetails?.organization?._id || user?.organizationDetails?.organization,
          location: user?.organizationDetails?.location?.id || user?.organizationDetails?.location,
          reportingManager: user?.organizationDetails?.reportingManager?._id || user?.organizationDetails?.reportingManager,
          ...updateData
        }
      });

      const fieldName = assignmentModal.type === 'role' ? 'Role' : 'Department';
      message.success(`${fieldName} updated successfully`);
      refetch();
      setAssignmentModal({ isOpen: false, type: null });
    } catch (err: any) {
      const fieldName = assignmentModal.type === 'role' ? 'role' : 'department';
      message.error(err?.response?.data?.message || `Failed to update ${fieldName}`);
    }
  }

  const handleResetPassword = () => {
    setResetPasswordModal(true);
  }

  const handleResetPasswordConfirm = async () => {
    try {
      await userApi.resetPassword(userId);
      message.success('Password reset successfully');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to reset password');
    }
  }

  const handleStatusChange = (type: 'activate' | 'deactivate') => {
    setStatusChangeType(type);
    setStatusChangeModal(true);
  }

  const handleStatusChangeConfirm = async () => {
    if (!statusChangeType) return;

    try {
      const newActiveStatus = statusChangeType === 'activate';
      await userApi.updateUser(userId, { active: newActiveStatus });

      const actionText = statusChangeType === 'activate' ? 'activated' : 'deactivated';
      message.success(`User ${actionText} successfully`);
      refetch();
    } catch (err: any) {
      const actionText = statusChangeType === 'activate' ? 'activate' : 'deactivate';
      message.error(err?.response?.data?.message || `Failed to ${actionText} user`);
    } finally {
      setStatusChangeModal(false);
      setStatusChangeType(null);
    }
  }

  // Build activity logs from timestamps
  const logs: { title: string; date: string }[] = []
  if (user?.createdAt) {
    logs.push({ title: 'User created', date: new Date(user.createdAt).toLocaleDateString() })
  }
  if (user?.updatedAt && user.updatedAt !== user.createdAt) {
    logs.push({ title: 'User updated', date: new Date(user.updatedAt).toLocaleDateString() })
  }
  if ((user as any)?.lastLogin) {
    logs.push({ title: 'Last login', date: new Date((user as any).lastLogin).toLocaleDateString() })
  }

  if (loading) {
    return <div className="text-center py-8">Loading user...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>
  }

  const fullName = user.firstName || user.fname || ''
  const lastName = user.lastName || user.lname || ''
  const displayName = `${fullName} ${lastName}`.trim() || ''
  const roleLabel = user.organizationDetails?.role?.name || user.role || '-'
  const departmentLabel = user.organizationDetails?.department?.name || '-'
  const companyName = user.organizationDetails?.organization?.organizationName || '-'
  const managerEmail = user.organizationDetails?.reportingManager?.email || '-'
  const statusLabel = user.active ? 'Active' : 'Inactive'

  // Extract assigned modules from permissions
  const permissions = (user?.organizationDetails?.role as any)?.permissions as Record<string, string[]> | undefined
  const assignedModules = permissions
    ? Object.keys(permissions).filter(
      module => permissions[module] && permissions[module].length > 0
    )
    : []

  // Extract role permissions (only modules with permissions)
  const rolePermissions = permissions
    ? Object.entries(permissions).filter(
      ([_, perms]) => Array.isArray(perms) && perms.length > 0
    )
    : []

  // Define tabs
  const tabs = [
    { key: 'personal-details', label: 'Personal Details' },
    { key: 'activity-logs', label: 'Activity Logs' }
  ]

  // Define header actions
  const getHeaderActions = () => [
    {
      label: 'Reset Password',
      onClick: handleResetPassword,
      type: 'default' as const
    },
    {
      label: user.active ? 'Deactivate' : 'Activate',
      onClick: () => handleStatusChange(user.active ? 'deactivate' : 'activate'),
      type: 'default' as const
    },
    {
      label: 'Assign Role',
      onClick: handleAssignRole,
      type: 'default' as const
    },
    {
      label: 'Assign Department',
      onClick: handleAssignDepartment,
      type: 'default' as const
    },
    {
      label: 'Edit',
      onClick: handleEdit,
      type: 'primary' as const
    }
  ]

  // Render Personal Details Tab
  const renderPersonalDetails = () => (
    <div className="grid grid-cols-12 gap-6">
      {/* Personal Info - Left Column */}
      <div className="col-span-12 md:col-span-4 bg-white rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-semibold">Personal Info</h2>
          <span className={`px-3 py-1 text-xs ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src={(user as any)?.avatar || 'https://i.pravatar.cc/120'}
            alt="profile"
            width={96}
            height={96}
            className="rounded-full"
          />
          <h3 className="mt-4 font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-gray-500">
            {roleLabel} • {departmentLabel}
          </p>
        </div>

        <InfoItem icon={<User2 size={20} />} label="Gender" value={user.gender || '-'} />
        <InfoItem icon={<Mail size={20} />} label="Email Address" value={user.email || '-'} />
        <InfoItem icon={<Phone size={20} />} label="Phone Number" value={user.mobileNumber || '-'} />
        <InfoItem icon={<Calendar size={20} />} label="Created Date" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} />
      </div>

      {/* Right Section - Contains two cards in a row + full width cards below */}
      <div className="col-span-12 md:col-span-8 space-y-6">
        {/* Row with Organizational Details & Assigned Asset */}
        <div className="grid grid-cols-2 gap-6">
          {/* Organizational Details */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Organizational Details</h2>

            <DetailRow label="Company Name" value={companyName} />
            <DetailRow label="Department" value={departmentLabel} />
            <DetailRow label="Reporting manager" value={managerEmail} />
            <DetailRow
              label="Location"
              value={user.organizationDetails?.location ? `${user.organizationDetails.location.city || ''} ${user.organizationDetails.location.country || ''}` : '-'}
            />

            <button className="mt-3 text-sm text-green-700">
              Show On Map
            </button>
          </div>

          {/* Assigned Asset */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Assigned Asset</h2>

            <DetailRow label="Laptop" value="-" />
            <DetailRow label="Phone" value="-" />
            <DetailRow label="Status" value={statusLabel} />
          </div>
        </div>

        {/* Assigned Modules - Full Width */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Assigned Modules</h2>

          {assignedModules.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedModules.map((module) => (
                <span
                  key={module}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize"
                >
                  {module}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No modules assigned</p>
          )}
        </div>

        {/* Role Permissions - Full Width */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Role Permissions</h2>

          {rolePermissions.length > 0 ? (
            <div className="space-y-3">
              {rolePermissions.map(([module, permissions]) => (
                <div key={module}>
                  <p className="text-sm font-medium text-gray-700 mb-1 capitalize">{module}</p>
                  <div className="flex flex-wrap gap-1">
                    {(permissions as string[]).map((permission) => (
                      <span
                        key={permission}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No permissions assigned</p>
          )}
        </div>
      </div>
    </div>
  )

  // Render Activity Logs Tab
  const renderActivityLogs = () => (
    <div className="bg-[#F1FAFF] rounded-xl p-6">
      <h2 className="font-semibold mb-4">Activity Logs</h2>

      {logs.map((l) => (
        <LogItem
          key={l.title + l.date}
          title={l.title}
          desc={l.date}
        />
      ))}
    </div>
  )

  return (
    <>
      <TabContainer
        tabs={tabs}
        title={displayName}
        backRoute="/user-management/users"
        getHeaderActions={getHeaderActions}
      >
        {(activeTab) => {
          switch (activeTab) {
            case 'personal-details':
              return renderPersonalDetails()
            case 'activity-logs':
              return renderActivityLogs()
            default:
              return renderPersonalDetails()
          }
        }}
      </TabContainer>

      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal({ isOpen: false, type: null })}
        onConfirm={handleAssignmentConfirm}
        type={assignmentModal.type || 'role'}
        currentValueId={
          assignmentModal.type === 'role'
            ? user?.organizationDetails?.role?._id
            : user?.organizationDetails?.department?._id
        }
      />

      <ConfirmationModal
        isOpen={resetPasswordModal}
        onClose={() => setResetPasswordModal(false)}
        onConfirm={handleResetPasswordConfirm}
        title="RESET PASSWORD"
        body="Do you really want to reset password?"
      />

      <ConfirmationModal
        isOpen={statusChangeModal}
        onClose={() => {
          setStatusChangeModal(false);
          setStatusChangeType(null);
        }}
        onConfirm={handleStatusChangeConfirm}
        title={statusChangeType === 'activate' ? 'ACTIVATE USER' : 'DEACTIVATE USER'}
        body={`Do you really want to ${statusChangeType} this user?`}
      />
    </>
  )
}


function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="text-gray-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: any) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-1 sm:gap-4 text-sm mb-3">
      <span className="text-gray-500 sm:col-span-2">{label}</span>
      <span className="font-medium break-words sm:col-span-2">{value}</span>
    </div>
  )
}

function LogItem({ title, desc }: any) {
  return (
    <div className="flex gap-3 mb-4">
      <span className="w-3 h-3 mt-1 rounded-full bg-green-600" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-600 whitespace-pre-line">
          {desc}
        </p>
      </div>
    </div>
  )
}
