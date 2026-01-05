'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import CompanyDetailsTab from './CompanyDetailsTab'
import AssignedUsersTab from '../../roles/[roleId]/AssignedUsersTab'
import { useOrganization } from '@/hooks/useOrganizations'

const tabs = [
  { key: 'details', label: 'Organization Details' },
  { key: 'users', label: 'Assigned Users' },
]

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const { organization, loading, error } = useOrganization(organizationId)

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
            return <AssignedUsersTab />
          default:
            return <CompanyDetailsTab company={organizationWithLogs} />
        }
      }}
    </TabContainer>
  )
}
