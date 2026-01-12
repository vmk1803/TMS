import { Table, Input, Button, Dropdown } from 'antd'
import {
  Search,
  Eye,
  Pencil,
  Trash2Icon,
  Plus,
  Download,
  ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
}: ListPageProps) {
  const router = useRouter()

  // Enhanced columns with actions
  const enhancedColumns = [
    {
      title: <input type="checkbox" className="mx-2" />,
      render: () => <input type="checkbox" />,
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
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex gap-3 text-secondary">
          <Button 
            className="flex items-center gap-2 rounded-xl border-secondary"
            onClick={onExportCSV}
            disabled={isExporting || !onExportCSV}
            loading={isExporting}
          >
            <Download className='text-secondary' size={16} /> 
            <span className="text-secondary">
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </span>
          </Button>
          <Button
            type="primary"
            className="flex items-center gap-2 bg-secondary rounded-xl"
            onClick={onCreate}
          >
            <Plus size={16} /> Create New
          </Button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="relative w-[35%]">
            <Search
              className="absolute left-3 top-2.5 z-10 text-secondary"
              size={16}
            />
            <Input
              placeholder={filters.searchPlaceholder || "Search"}
              className="pl-9 rounded-xl border-secondary"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {filters.dropdowns.map((dropdown, index) => (
              <Dropdown
                key={index}
                menu={{
                  items: dropdown.items,
                  onClick: dropdown.onClick
                }}
              >
                <Button className="flex items-center gap-2 rounded-xl">
                  {dropdown.label} <ChevronDown size={14} />
                </Button>
              </Dropdown>
            ))}
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
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                Items per page:
                <select
                  className="border rounded px-2 py-1 bg-[#efeff5]"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div>
                {pagination.current_page * pagination.page_size - pagination.page_size + 1}–{Math.min(pagination.current_page * pagination.page_size, pagination.total_records)} of {pagination.total_records}
              </div>
            </div>

            {/* Page Navigation */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.current_page === 1}
                  onClick={() => onPageChange?.(pagination.current_page - 1)}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 ${
                        pagination.current_page === pageNum ? 'bg-secondary text-white' : ''
                      }`}
                      onClick={() => onPageChange?.(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.current_page === pagination.total_pages}
                  onClick={() => onPageChange?.(pagination.current_page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
