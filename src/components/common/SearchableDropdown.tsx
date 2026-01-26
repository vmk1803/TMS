import { Dropdown, Input, Menu, Button } from 'antd'
import { Search, ChevronDown } from 'lucide-react'
import { useState, useMemo } from 'react'

interface SearchableDropdownProps {
  label: string
  items: { key: string; label: string }[]
  onClick?: (item: { key: string }) => void
  className?: string
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  maxWidth?: number
  maxHeight?: number
  disabled?: boolean
}

export default function SearchableDropdown({
  label,
  items,
  onClick,
  className = '',
  placement = 'bottomRight',
  maxWidth = 180,
  maxHeight = 200,
  disabled = false
}: SearchableDropdownProps) {
  const [searchText, setSearchText] = useState('')

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    if (!searchText) return items
    return items.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [items, searchText])

  // Create dropdown overlay with search
  const dropdownOverlay = (
    <div 
      style={{ maxWidth: `${maxWidth}px` }}
      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
    >
      {/* Search input */}
      <div className="p-2 border-b border-gray-100">
        <Input
          placeholder="Search..."
          prefix={<Search size={14} className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="text-sm bg-gray-50 rounded-xl border border-gray-300"
          bordered={true}
          autoFocus
        />
      </div>
      
      {/* Menu items */}
      <div 
        style={{ maxHeight: `${maxHeight}px` }}
        className="overflow-y-auto scrollbar-custom"
      >
        <Menu
          items={filteredItems}
          onClick={(item) => {
            onClick?.(item)
            setSearchText('') // Clear search when item is selected
          }}
          className="border-0 bg-white"
          style={{ boxShadow: 'none' }}
        />
      </div>
    </div>
  )

  return (
    <Dropdown
      dropdownRender={() => dropdownOverlay}
      trigger={['click']}
      placement={placement}
      disabled={disabled}
    >
      <Button disabled={disabled} className={`flex items-center gap-2 rounded-xl ${className}`}>
        {label} <ChevronDown size={14} />
      </Button>
    </Dropdown>
  )
}
