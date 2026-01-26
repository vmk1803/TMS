import { Table, Input, Button, Badge } from 'antd'
import {
  Search,
  Eye,
  Pencil,
  Trash2Icon,
  Plus,
  Download,
  Filter,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import SearchableDropdown from './SearchableDropdown'
import Pagination from './Pagination'
import FilterModal from './FilterModal'

// Interface for bulk action buttons
interface BulkActionButton {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: (selectedIds: string[], selectedRecords: any[]) => void
  disabled?: boolean
  loading?: boolean
  danger?: boolean
  className?: string
}

interface ListPageProps {
  title: string
  description: string
  data: any[]
  columns: any[]
  filters: {
    searchPlaceholder?: string
    dropdowns: {
      label: string
      items: { key: string; label: string }[]
      onClick?: (item: { key: string }) => void
    }[]
    customFilters?: React.ReactNode
  }
  onCreate: () => void
  onView: (record: any) => void
  onEdit: (record: any) => void
  onDelete: (record: any) => void
  onExportCSV?: () => void
  isExporting?: boolean
  pagination?: {
    total_records: number
    total_pages: number
    page_size: number
    current_page: number
    next_page: number | null
    prev_page: number | null
  }
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  onPageChange?: (page: number) => void
  // Search functionality
  searchQuery?: string
  onSearchChange?: (query: string) => void
  isSearching?: boolean
  // Configurable bulk actions
  bulkActions?: BulkActionButton[]
  // Filter modal
  activeFilterCount?: number
  onClearFilters?: () => void
}

export default function ListPage({
  title,
  description,
  data,
  columns,
  filters,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onExportCSV,
  isExporting = false,
  pagination,
  pageSize = 10,
  onPageSizeChange,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  isSearching = false,
  bulkActions = [],
  activeFilterCount = 0,
  onClearFilters,
}: ListPageProps) {
  const router = useRouter()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  // Reset selection when data changes
  useEffect(() => {
    setSelectedRowKeys([])
    setSelectAll(false)
  }, [data])

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(item => item.id || item._id)
      setSelectedRowKeys(allIds)
      setSelectAll(true)
    } else {
      setSelectedRowKeys([])
      setSelectAll(false)
    }
  }

  // Handle individual row checkbox
  const handleRowSelect = (recordId: string, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedRowKeys, recordId]
      setSelectedRowKeys(newSelection)
      setSelectAll(newSelection.length === data.length)
    } else {
      const newSelection = selectedRowKeys.filter(id => id !== recordId)
      setSelectedRowKeys(newSelection)
      setSelectAll(false)
    }
  }

  // Get selected records - ensure data is always an array
  const selectedRecords = (Array.isArray(data) ? data : []).filter(item =>
    selectedRowKeys.includes(item.id || item._id)
  )

  // Enhanced columns with actions
  const enhancedColumns = [
    {
      title: (
        <input
          type="checkbox"
          className="mx-2"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      render: (record: any) => (
        <input
          type="checkbox"
          checked={selectedRowKeys.includes(record.id || record._id)}
          onChange={(e) => handleRowSelect(record.id || record._id, e.target.checked)}
        />
      ),
      width: 40,
    },
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex gap-3 text-secondary">
          <Eye
            size={16}
            className="cursor-pointer"
            onClick={() => onView(record)}
          />
          <Pencil
            size={16}
            className="cursor-pointer"
            onClick={() => onEdit(record)}
          />
          <Trash2Icon
            size={16}
            className="cursor-pointer"
            onClick={() => onDelete(record)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="bg-[#F7F9FB]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            {selectedRowKeys.length > 0
              ? `${selectedRowKeys.length} item${selectedRowKeys.length > 1 ? 's' : ''} selected`
              : description
            }
          </p>
        </div>

        <div className="flex gap-3 text-secondary">
          {selectedRowKeys.length > 0 ? (
            // Dynamic bulk action buttons
            <>
              {bulkActions.map((action) => (
                <div
                  key={action.key}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary text-secondary cursor-pointer transition-colors duration-200 ${action.danger ? 'hover:bg-red-600 hover:border-red-600 hover:text-white' : 'hover:bg-secondary hover:border-secondary hover:text-white'} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${action.className || ''}`}
                  onClick={() => !action.disabled && !action.loading && action.onClick(selectedRowKeys, selectedRecords)}
                >
                  {action.loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  )}
                  {!action.loading && action.icon}
                  <span className="text-sm font-medium">
                    {action.label}
                  </span>
                </div>
              ))}
            </>
          ) : (
            // Regular action buttons
            <>
              {/* Export CSV Button */}
              <Button
                className="flex items-center gap-2 rounded-xl border-secondary"
                onClick={onExportCSV}
                disabled={isExporting || !onExportCSV}
                loading={isExporting}
              >
                <Download className='text-secondary' size={16} />
                <span className="hidden sm:inline text-secondary">
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </span>
              </Button>

              {/* Create New Button */}
              <Button
                type="primary"
                className="flex items-center gap-2 bg-secondary rounded-xl"
                onClick={onCreate}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Create New</span>
                <span className="sm:hidden">New</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-4 gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 md:flex-none md:w-[35%]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-secondary"
              size={18}
            />
            <Input
              placeholder={filters.searchPlaceholder || "Search"}
              className="pl-10 rounded-xl border-secondary"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>

          {/* Desktop: Show all filters inline */}
          <div className="hidden md:flex gap-3">
            {filters.dropdowns.map((dropdown, index) => (
              <SearchableDropdown
                key={index}
                label={dropdown.label}
                items={dropdown.items}
                onClick={dropdown.onClick}
                placement="bottomRight"
              />
            ))}
            {filters.customFilters}
          </div>

          {/* Mobile/Tablet: Show Filters button */}
          <div className="flex md:hidden">
            <Badge count={activeFilterCount} offset={[-5, 5]}>
              <Button
                icon={<Filter size={16} />}
                onClick={() => setFilterModalOpen(true)}
                className="rounded-xl border-secondary"
              >
                <span className="text-secondary">Filters</span>
              </Button>
            </Badge>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={enhancedColumns}
          dataSource={data}
          pagination={false}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          components={{
            header: {
              cell: (props: any) => <th {...props} className="bg-secondary text-secondary" />,
            },
          }}
        />

        {/* Footer */}
        {pagination && (
          <Pagination
            page={pagination.current_page}
            pageSize={pageSize}
            totalItems={pagination.total_records}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            maxPageButtons={3}
            resetPageOnPageSizeChange
            clampPageToRange
          />
        )}
      </div>

      {/* Filter Modal for Mobile/Tablet */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onClearAll={() => {
          onClearFilters?.()
          setFilterModalOpen(false)
        }}
        filters={filters}
      />
    </div>
  )
}
