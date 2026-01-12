'use client'

import { useRef, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useUsersByDepartment } from '@/hooks/useUsersByDepartment'
import YearSelector from '../../common/YearSelector'

/* ---------- Color Palette ---------- */
const CHART_COLORS = [
  '#8CA2FF',
  '#CFF0F7', 
  '#FEB7CA',
  '#F8C99E',
  '#FA8E8E',
  '#88DED5',
  '#72C8E9',
  '#A78BFA',
  '#FB7185',
  '#34D399'
]

/* ---------- Custom Tooltip ---------- */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          {payload[0].value} users
        </p>
        {data.organizationName && (
          <p className="text-xs text-gray-400">{data.organizationName}</p>
        )}
      </div>
    )
  }
  return null
}

export default function UsersByDepartmentBarChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)

  // Use the new hook for department data
  const { data, loading, error, updateFilters } = useUsersByDepartment({
    autoFetch: true,
    year: selectedYear
  })

  const handleYearChange = (year: number | undefined) => {
    setSelectedYear(year)
    updateFilters({ year })
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Transform data for the chart
  const chartData = data?.departments?.map((dept, index) => ({
    department: dept.departmentName,
    users: dept.userCount,
    organizationName: dept.organizationName,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || []

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Users by Department</h3>
        <div className="flex gap-2 items-center">
          <YearSelector
            value={selectedYear}
            onChange={handleYearChange}
            disabled={loading}
          />
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 size={18} className="text-gray-600" />
            ) : (
              <Maximize2 size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">Error loading department data: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading department analytics...</div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={isFullscreen ? '85%' : 260}>
          <BarChart
            data={chartData}
            barCategoryGap={24}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#ACB5BD"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={0}
              angle={chartData.length > 6 ? -45 : 0}
              textAnchor={chartData.length > 6 ? 'end' : 'middle'}
              height={chartData.length > 6 ? 60 : 30}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />

            <Bar
              dataKey="users"
              radius={[24, 24, 0, 0]}
              maxBarSize={40}
              activeBar={null}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  stroke="none"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Empty State */}
      {!loading && !error && chartData.length === 0 && (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No department data available
        </div>
      )}

      {/* Summary */}
      {!loading && !error && data && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Total: {data.totalUsers} users across {data.departments.length} departments
        </div>
      )}
    </div>
  )
}