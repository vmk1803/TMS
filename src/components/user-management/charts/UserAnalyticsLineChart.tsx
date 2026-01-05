'use client'

import { useRef, useState } from 'react'
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

const data = [
  { month: 'Jan', users: 320 },
  { month: 'Feb', users: 210 },
  { month: 'Mar', users: 260 },
  { month: 'Apr', users: 340 },
  { month: 'May', users: 360 },
  { month: 'Jun', users: 520 },
  { month: 'Jul', users: 580 },
  { month: 'Aug', users: 470 },
  { month: 'Sep', users: 510 },
  { month: 'Oct', users: 390 },
  { month: 'Nov', users: 450 },
  { month: 'Dec', users: 480 },
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

export default function UserAnalyticsLineChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  return (
    <div
      ref={containerRef}
    >
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">User Analytics</h3>
        <div className="flex gap-2">
              <select className="border rounded-lg px-2 py-1 text-sm">
                <option>All Roles</option>
              </select>
              <select className="border rounded-lg px-2 py-1 text-sm">
                <option>2025</option>
              </select>
                      <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
            </div>

      </div>

      {/* ---------- Chart ---------- */}
      <ResponsiveContainer width="100%" height={isFullscreen ? '90%' : 260}>
        <LineChart
          data={data}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
