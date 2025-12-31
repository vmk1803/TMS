'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from 'antd'
import { ChevronLeft } from 'lucide-react'

interface Tab {
  key: string
  label: string
}

interface TabContainerProps {
  tabs: Tab[]
  children: (activeTab: string) => React.ReactNode
  title?: string
  backRoute?: string
  editRoute?: string
  showEditButton?: boolean
}

export default function TabContainer({
  tabs,
  children,
  title,
  backRoute,
  editRoute,
  showEditButton = true,
}: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '')
  const router = useRouter()

  const handleBack = () => {
    if (backRoute) {
      router.push(backRoute)
    } else {
      router.back()
    }
  }

  const handleEdit = () => {
    if (editRoute) {
      router.push(editRoute)
    }
  }

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
          <ChevronLeft size={14} />
          <span className="text-sm text-gray-500">Back</span>
        </div>
        {showEditButton && (
          <Button type="primary" className="rounded-xl bg-secondary" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>

      {title && (
        <h1 className="text-lg font-semibold mb-4">{title}</h1>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium ${
              activeTab === tab.key
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {children(activeTab)}
    </div>
  )
}
