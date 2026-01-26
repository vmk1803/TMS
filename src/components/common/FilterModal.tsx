'use client'

import { Drawer } from 'antd'
import { X } from 'lucide-react'
import SearchableDropdown from './SearchableDropdown'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onClearAll: () => void
  filters: {
    dropdowns: {
      label: string
      items: { key: string; label: string }[]
      onClick?: (item: { key: string }) => void
    }[]
    customFilters?: React.ReactNode
  }
}

export default function FilterModal({
  isOpen,
  onClose,
  onClearAll,
  filters
}: FilterModalProps) {
  const handleClearAll = () => {
    onClearAll()
    onClose()
  }

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Filters</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      }
      placement="bottom"
      onClose={onClose}
      open={isOpen}
      height="auto"
      closable={false}
      styles={{
        body: { paddingBottom: 80 }
      }}
    >
      <div className="space-y-4">
        {/* Dropdown Filters */}
        {filters.dropdowns.map((dropdown, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {dropdown.label.replace('All ', '')}
            </label>
            <SearchableDropdown
              label={dropdown.label}
              items={dropdown.items}
              onClick={dropdown.onClick}
              placement="bottomLeft"
            />
          </div>
        ))}

        {/* Custom Filters */}
        {filters.customFilters && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Date
            </label>
            <div className="[&>*]:w-full">
              {filters.customFilters}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3">
        <button
          onClick={handleClearAll}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-xl bg-secondary text-white font-medium hover:bg-blue-500"
        >
          Apply
        </button>
      </div>
    </Drawer>
  )
}
