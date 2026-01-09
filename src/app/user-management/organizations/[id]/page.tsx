'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import CompanyDetailsTab from './CompanyDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import { useOrganization } from '@/hooks/useOrganizations'
import { useUsersByOrganization } from '@/hooks/useUsers'

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const { organization, loading, error } = useOrganization(organizationId)
  const { users: organizationUsers, loading: usersLoading, error: usersError } = useUsersByOrganization(organizationId)

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error || !organization) {
    return <div className="text-center py-8">Organization not found</div>
  }

  // Construct logs data for the organization
  const organizationWithLogs = {
    ...organization,
    logs: [
      {
        title: 'Created',
        date: organization.createdAt ? `Created on ${new Date(organization.createdAt).toLocaleDateString()}` : 'Created date not available',
      },
    ],
  }

  const tabs = [
    { key: 'details', label: 'Organization Details' },
    { key: 'users', label: `Assigned Users (${organizationUsers.length})` },
  ]

  return (
    <TabContainer
      tabs={tabs}
      backRoute="/user-management/organizations"
      editRoute={`/user-management/organizations/create?organizationId=${organizationId}`}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <CompanyDetailsTab company={organizationWithLogs} />
          case 'users':
            return <AssignedUsersTab organizationId={organizationId} users={organizationUsers} loading={usersLoading} error={usersError} />
          default:
            return <CompanyDetailsTab company={organizationWithLogs} />
        }
      }}
    </TabContainer>
  )
}
