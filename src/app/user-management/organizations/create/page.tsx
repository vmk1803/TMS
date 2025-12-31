'use client'

import OrganizationForm from '@/components/user-management/organization/OrganizationForm'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrganization, useOrganizations } from '@/hooks/useOrganizations'

export default function CreateEditOrganizationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationId = searchParams.get('organizationId')

  const isEdit = Boolean(organizationId)

  // Fetch organization data for edit mode
  const { organization, loading: fetchLoading } = useOrganization(organizationId || null)

  // Get the create/update functions
  const { createOrganization, updateOrganization } = useOrganizations({
    autoFetch: false
  })

  const handleSubmit = async (values: any) => {
    try {
      const submissionData = {
        ...values,
        createdAt: new Date().toISOString() // Include frontend server timestamp
      }

      if (organizationId) {
        await updateOrganization(organizationId, values)
      } else {
        await createOrganization(submissionData)
      }

      // Redirect to organization list page
      router.push('/user-management/organizations')
    } catch (error) {
      console.error('Organization submission error:', error)
      // Error is already handled by the hook
      throw error // Re-throw to let form handle loading state
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Show loading while fetching data for edit
  if (isEdit && fetchLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <OrganizationForm
      isEdit={isEdit}
      initialValues={organization ? {
        organizationName: organization.organizationName,
        email: organization.email,
        contactNumber: organization.contactNumber,
        description: organization.description,
        primaryAdmin: organization.primaryAdmin,
        locations: organization.locations,
      } : undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}
