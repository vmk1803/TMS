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

/* ---------- Data ---------- */
const data = [
  { department: 'Product', users: 620 },
  { department: 'Sales', users: 430 },
  { department: 'Operations', users: 520 },
  { department: 'Support', users: 610 },
  { department: 'QA', users: 190 },
  { department: 'Development', users: 480 },
  { department: 'Design', users: 340 },
]

/* ---------- Gradient Map ---------- */
const DEPARTMENT_GRADIENTS: Record<string, string> = {
  Product: 'productGradient',
  Sales: 'salesGradient',
  Operations: 'operationsGradient',
  Support: 'supportGradient',
  QA: 'qaGradient',
  Development: 'developmentGradient',
  Design: 'designGradient',
}

/* ---------- Custom Tooltip ---------- */
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

export default function UsersByDepartmentBarChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Users by Department</h3>
        <div>
               <select className="border rounded-lg px-2 py-1 text-sm">
              <option>2025</option>
            </select>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
         </div>
      </div>

      {/* ---------- CHART ---------- */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
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

          {/* ---------- Gradients ---------- */}
          <defs>
            <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8CA2FF" />
              <stop offset="100%" stopColor="rgba(140,162,255,0)" />
            </linearGradient>

            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CFF0F7" />
              <stop offset="100%" stopColor="rgba(207,240,247,0)" />
            </linearGradient>

            <linearGradient id="operationsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEB7CA" />
              <stop offset="100%" stopColor="rgba(254,183,202,0)" />
            </linearGradient>

            <linearGradient id="supportGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8C99E" />
              <stop offset="100%" stopColor="rgba(248,201,158,0)" />
            </linearGradient>

            <linearGradient id="qaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FA8E8E" />
              <stop offset="100%" stopColor="rgba(250,142,142,0)" />
            </linearGradient>

            <linearGradient id="developmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#88DED5" />
              <stop offset="100%" stopColor="rgba(136,222,213,0)" />
            </linearGradient>

            <linearGradient id="designGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#72C8E9" />
              <stop offset="100%" stopColor="rgba(114,200,233,0)" />
            </linearGradient>
          </defs>

          <Bar
            dataKey="users"
            radius={[24, 24, 0, 0]}
            maxBarSize={40}
            activeBar={null}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={`url(#${DEPARTMENT_GRADIENTS[entry.department]})`}
                stroke="none"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}