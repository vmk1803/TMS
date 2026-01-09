'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { message } from 'antd'
import { useUser } from '../../../../hooks/useUser'
import { userApi } from '../../../../services/userService'
import AssignmentModal from '../AssignmentModal'
import ConfirmationModal from '../../../../components/common/ConfirmationModal'

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

  return (
    <div className="p-6 bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/user-management/users')} className="flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> User Details
        </button>

        <div className="flex gap-2">
          {[
            { id: 'reset-password', label: 'Reset Password', onClick: handleResetPassword },
            {
              id: 'status-change',
              label: user.active ? 'Deactivate' : 'Activate',
              onClick: () => handleStatusChange(user.active ? 'deactivate' : 'activate')
            },
            { id: 'assign-role', label: 'Assign Role', onClick: handleAssignRole },
            { id: 'assign-department', label: 'Assign Department', onClick: handleAssignDepartment }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className="px-4 py-2 text-sm border border-secondary text-secondary rounded-2xl"
            >
              {btn.label}
            </button>
          ))}
          <button onClick={handleEdit} className="px-5 py-2 text-sm bg-secondary text-white rounded-2xl">
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Card */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-semibold">Personal Info</h2>
            <span className={`px-3 py-1 text-xs ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} rounded-full`}>
              {statusLabel}
            </span>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src={ (user as any)?.avatar || 'https://i.pravatar.cc/120' }
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

          <InfoItem label="Email Address" value={user.email || '-'} />
          <InfoItem label="Phone Number" value={user.mobileNumber || '-'} />
          <InfoItem label="Created Date" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} />
        </div>

        {/* Right Section */}
        <div className="col-span-12 md:col-span-8 space-y-6">

          <div className='grid grid-cols-[1fr_1fr] space-x-4'>
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

            <DetailRow
              label="Laptop"
              value="-"
            />
            <DetailRow
              label="Phone"
              value="-"
            />
            <DetailRow label="Status" value={statusLabel} />
          </div>
          </div>
     

          {/* Activity Logs */}
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
        </div>
      </div>

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
    </div>
  )
}


function InfoItem({ label, value }: any) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: any) {
  return (
    <div className="grid grid-cols-4 gap-4 text-sm mb-2">
      <span className="text-gray-500 col-span-2">{label}</span>
      <span className="col-span-2 font-medium">{value}</span>
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
