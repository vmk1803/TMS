'use client'

import { useRef, useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useUserTrends } from '@/hooks/useUserTrends'

interface UserAnalyticsLineChartProps {
  className?: string
}

// Fallback data for when no analytics data is available
const fallbackData = [
  { month: 'Jan', users: 0 },
  { month: 'Feb', users: 0 },
  { month: 'Mar', users: 0 },
  { month: 'Apr', users: 0 },
  { month: 'May', users: 0 },
  { month: 'Jun', users: 0 },
  { month: 'Jul', users: 0 },
  { month: 'Aug', users: 0 },
  { month: 'Sep', users: 0 },
  { month: 'Oct', users: 0 },
  { month: 'Nov', users: 0 },
  { month: 'Dec', users: 0 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          {payload[0].value} users
        </p>
      </div>
    )
  }
  return null
}

export default function UserAnalyticsLineChart({ className }: UserAnalyticsLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedRole, setSelectedRole] = useState('all')

  // Use the new UserTrends hook
  const { data, loading, error, updateFilters } = useUserTrends({
    autoFetch: true,
    year: selectedYear,
    roleId: selectedRole === 'all' ? undefined : selectedRole
  })

  // Update filters when dropdowns change
  useEffect(() => {
    updateFilters({
      year: selectedYear,
      roleId: selectedRole === 'all' ? undefined : selectedRole
    })
  }, [selectedYear, selectedRole, updateFilters])

  // Get chart data from API response or use fallback
  const chartData = data?.monthlyData || fallbackData
  const availableRoles = data?.availableRoles || []

  /* ---------- Fullscreen Toggle ---------- */
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Generate year options (current year and previous 4 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div ref={containerRef} className={className}>
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">User Analytics</h3>
        <div className="flex gap-2 items-center">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-w-[120px]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Roles</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          
          <select 
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-w-[80px]"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={loading}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 size={18} className="text-gray-600" />
            ) : (
              <Maximize2 size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* ---------- Error State ---------- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">Error loading analytics: {error}</p>
        </div>
      )}

      {/* ---------- Chart ---------- */}
      <ResponsiveContainer width="100%" height={isFullscreen ? '90%' : 260}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#ACB5BD"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'transparent' }}
          />

          {/* Gradient shade */}
          <defs>
            <linearGradient id="lineShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>

          {loading ? (
            // Show loading state
            <text x="50%" y="50%" textAnchor="middle" fill="#6B7280" fontSize="14">
              Loading analytics...
            </text>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="users"
                stroke="none"
                fill="url(#lineShade)"
              />

              <Line
                type="monotone"
                dataKey="users"
                stroke="#0095FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
