'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import TabContainer, { HeaderAction } from '@/components/common/TabContainer'
import CompanyDetailsTab from './CompanyDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import { useOrganization } from '@/hooks/useOrganizations'
import { useUsersByOrganization } from '@/hooks/useUsers'

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const { organization, loading, error, updateOrganization } = useOrganization(organizationId)
  const { users: organizationUsers, loading: usersLoading, error: usersError, bulkUpdateUsers } = useUsersByOrganization(organizationId)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error || !organization) {
    return <div className="text-center py-8">Organization not found</div>
  }

  const handleRemoveUsers = async () => {
    if (selectedRows.length === 0) return

    const success = await bulkUpdateUsers(selectedRows, { 'organizationDetails.organization': null })
    if (success) {
      setSelectedRows([])
      setConfirmationModalOpen(false)
    }
  }

  const getHeaderActions = (activeTab: string): HeaderAction[] => {
    if (activeTab === 'details') {
      return [{
        label: 'Edit',
        onClick: () => router.push(`/user-management/organizations/create?organizationId=${organizationId}`),
        type: 'primary'
      }]
    } else if (activeTab === 'users') {
      const actions: HeaderAction[] = [{
        label: 'Remove',
        onClick: () => setConfirmationModalOpen(true),
        danger: true,
        disabled: selectedRows.length === 0
      }, {
        label: 'Add Users',
        onClick: () => router.push('/user-management/users'),
        type: 'primary'
      }]
      return actions
    }
    return []
  }

  // Construct logs data for the organization
  const creator = (organization as any).createdBy;
  const creatorName = creator && typeof creator === 'object' ? `${creator.firstName || 'Admin'} ${creator.lastName || ''}` : 'Unknown';
  const createdDate = organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'Date not available';

  const organizationWithLogs = {
    ...organization,
    logs: [
      {
        title: `Created by ${creatorName}`,
        subtitle: `Created on ${createdDate}`
      },
    ],
  }

  const tabs = [
    { key: 'details', label: 'Organization Details' },
    { key: 'users', label: `Assigned Users (${organizationUsers.length})`, disabled: organizationUsers.length === 0 },
  ]

  return (
    <>
      <TabContainer
        tabs={tabs}
        backRoute="/user-management/organizations"
        getHeaderActions={getHeaderActions}
      >
        {(activeTab) => {
          switch (activeTab) {
            case 'details':
              return <CompanyDetailsTab company={organizationWithLogs} updateOrganization={updateOrganization} />
            case 'users':
              return <AssignedUsersTab
                organizationId={organizationId}
                users={organizationUsers}
                loading={usersLoading}
                error={usersError}
                onSelectionChange={setSelectedRows}
              />
            default:
              return <CompanyDetailsTab company={organizationWithLogs} updateOrganization={updateOrganization} />
          }
        }}
      </TabContainer>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleRemoveUsers}
        title="Remove Users from Organization"
        body={`Are you sure you want to remove organization from ${selectedRows.length} user${selectedRows.length > 1 ? 's' : ''}?`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  )
}
