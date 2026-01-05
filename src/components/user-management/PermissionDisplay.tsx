import React, { useState } from 'react'
import { Tag, Button } from 'antd'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PermissionDisplayProps {
  permissions: {
    projects: string[]
    task: string[]
    users: string[]
    settings: string[]
  }
}

const PermissionDisplay: React.FC<PermissionDisplayProps> = ({ permissions }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderSectionPermissions = (sectionName: string, permissionList: string[]) => {
    if (!permissionList || permissionList.length === 0) {
      return null
    }

    const isExpanded = expandedSections[sectionName]
    const displayPermissions = isExpanded ? permissionList : permissionList.slice(0, 3)
    const hasMore = permissionList.length > 3 && !isExpanded

    return (
      <div className="mb-2 last:mb-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-medium text-gray-600 capitalize">
            {sectionName}:
          </span>
          {displayPermissions.map((permission) => (
            <Tag
              key={permission}
              className="text-xs px-2 py-0.5"
            >
              {permission}
            </Tag>
          ))}
          {hasMore && (
            <Button
              type="link"
              size="small"
              className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => toggleSection(sectionName)}
            >
              +{permissionList.length - 3} more
              <ChevronDown size={12} className="ml-1" />
            </Button>
          )}
          {isExpanded && permissionList.length > 3 && (
            <Button
              type="link"
              size="small"
              className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => toggleSection(sectionName)}
            >
              <ChevronUp size={12} />
            </Button>
          )}
        </div>
      </div>
    )
  }

  const sections = [
    { key: 'projects', label: 'Projects' },
    { key: 'task', label: 'Task' },
    { key: 'users', label: 'Users' },
    { key: 'settings', label: 'Settings' }
  ]

  return (
    <div className="max-w-md">
      {sections.map(({ key, label }) => (
        <div key={key}>
          {renderSectionPermissions(label.toLowerCase(), permissions[key as keyof typeof permissions] || [])}
        </div>
      ))}
    </div>
  )
}

export default PermissionDisplay
