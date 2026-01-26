'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Dropdown } from 'antd'
import { ChevronLeft, MoreVertical } from 'lucide-react'

interface Tab {
  key: string
  label: string
  disabled?: boolean
}

export interface HeaderAction {
  label: string
  onClick: () => void
  type?: 'primary' | 'default'
  danger?: boolean
  disabled?: boolean
}

interface TabContainerProps {
  tabs: Tab[]
  children: (activeTab: string) => React.ReactNode
  title?: string
  backRoute?: string
  editRoute?: string
  showEditButton?: boolean
  getHeaderActions?: (activeTab: string) => HeaderAction[]
}

export default function TabContainer({
  tabs,
  children,
  title,
  backRoute,
  editRoute,
  showEditButton = true,
  getHeaderActions,
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

  const headerActions = getHeaderActions ? getHeaderActions(activeTab) : []

  // Separate primary and secondary actions
  const primaryAction = headerActions.find(action => action.type === 'primary')
  const secondaryActions = headerActions.filter(action => action.type !== 'primary')

  // Dropdown menu items for mobile
  const dropdownItems = secondaryActions.map((action, index) => ({
    key: index.toString(),
    label: action.label,
    onClick: action.onClick,
    disabled: action.disabled,
    danger: action.danger,
  }))

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
          <ChevronLeft size={14} />
          <span className="text-sm text-gray-500">Back</span>
        </div>

        {/* Desktop: Show all buttons */}
        <div className="hidden md:flex gap-2">
          {headerActions.map((action, index) => (
            <Button
              key={index}
              type={action.type || 'default'}
              danger={action.danger}
              disabled={action.disabled}
              className={`rounded-xl ${
                action.disabled
                  ? action.danger
                    ? 'bg-white text-secondary border-secondary cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                  : action.danger
                    ? 'bg-white text-secondary border-secondary hover:bg-red-600 hover:text-white hover:border-red-600'
                    : action.type === 'primary'
                      ? 'bg-secondary text-white border-secondary hover:bg-blue-500 hover:border-blue-500'
                      : 'bg-white text-secondary border-secondary hover:bg-secondary hover:text-white hover:border-secondary'
              }`}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Mobile: Show primary button + More menu */}
        <div className="flex md:hidden gap-2">
          {secondaryActions.length > 0 && (
            <Dropdown
              menu={{ items: dropdownItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button className="rounded-xl border-secondary">
                <MoreVertical size={16} className="text-secondary" />
              </Button>
            </Dropdown>
          )}
          {primaryAction && (
            <Button
              type="primary"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="rounded-xl bg-secondary text-white border-secondary hover:bg-blue-500 hover:border-blue-500"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {title && (
        <h1 className="text-lg font-semibold mb-4">{title}</h1>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            disabled={tab.disabled}
            className={`pb-3 text-sm font-medium ${activeTab === tab.key
              ? 'border-b-2 border-secondary text-secondary'
              : tab.disabled
                ? 'text-gray-300 cursor-not-allowed'
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
