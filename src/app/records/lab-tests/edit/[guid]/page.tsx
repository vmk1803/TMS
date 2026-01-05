"use client"
import React from 'react'
import AddNewLabTest from '../../new/components/AddNewLabTest'
import { useParams } from 'next/navigation'

export default function EditLabTestPage() {
  const { guid } = useParams() as { guid?: string }
  return <AddNewLabTest guidProp={guid} />
}