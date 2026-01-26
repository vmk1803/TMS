'use client'

import DepartmentDetailsCard from '@/components/user-management/departments/DepartmentDetailsCard'

export default function DepartmentDetailsTab({ department, onEdit, updateDepartment }: any) {
  return (
    <DepartmentDetailsCard
      data={department}
      onEdit={onEdit}
      updateDepartment={updateDepartment}
    />
  )
}
