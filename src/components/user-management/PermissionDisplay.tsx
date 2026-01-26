import React, { useMemo, useState } from 'react'
import { Button } from 'antd'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PermissionDisplayProps {
  permissions?: Record<string, unknown>
}

const PermissionDisplay: React.FC<PermissionDisplayProps> = ({ permissions }) => {
  const [expanded, setExpanded] = useState(false)

  const allActions = useMemo(() => {
    const collected: string[] = []

    const collectStrings = (value: unknown) => {
      if (typeof value === 'string') {
        collected.push(value)
        return
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          collectStrings(item)
        }
      }
    }

    if (permissions && typeof permissions === 'object') {
      for (const value of Object.values(permissions)) {
        collectStrings(value)
      }
    }

    const seen = new Set<string>()
    const unique: string[] = []
    for (const action of collected) {
      const normalized = action?.toString?.() ?? ''
      if (!normalized || seen.has(normalized)) continue
      seen.add(normalized)
      unique.push(normalized)
    }

    return unique
  }, [permissions])

  const maxVisible = 4
  const visibleActions = expanded ? allActions : allActions.slice(0, maxVisible)
  const remainingCount = Math.max(0, allActions.length - maxVisible)

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-1 flex-wrap">
        {visibleActions.length === 0 ? (
          <span className="text-sm text-gray-500">—</span>
        ) : (
          visibleActions.map((action) => (
            <span
              key={action}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-900"
            >
              {action}
            </span>
          ))
        )}

        {!expanded && remainingCount > 0 && (
          <Button
            type="link"
            size="small"
            className="text-xs p-0 h-auto text-gray-600 hover:text-gray-800"
            onClick={() => setExpanded(true)}
          >
            +{remainingCount} More
          </Button>
        )}

        {expanded && remainingCount > 0 && (
          <Button
            type="link"
            size="small"
            className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
            onClick={() => setExpanded(false)}
            aria-label="Collapse permissions"
          >
            <ChevronUp size={12} />
          </Button>
        )}
      </div>
    </div>
  )
}

export default PermissionDisplay
