import DepartmentForm from '@/components/user-management/departments/DepartmentForm'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CreateEditDepartmentPage({ searchParams }: PageProps) {
  const departmentId = searchParams.departmentId as string

  return (
    <DepartmentForm
      title={departmentId ? 'Edit Department' : 'Create Department'}
    />
  )
}
