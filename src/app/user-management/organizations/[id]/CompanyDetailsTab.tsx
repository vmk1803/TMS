'use client'

import CompanyDetailsCard from '@/components/user-management/organization/OrganizationDetailsCard'

export default function CompanyDetailsTab({ company, updateOrganization }: any) {
  return <CompanyDetailsCard data={company} updateOrganization={updateOrganization} />
}
