'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Super Admin', value: 8, color: '#A5A3FF' },
  { name: 'Admin', value: 16, color: '#FFAD99' },
  { name: 'Managers', value: 34, color: '#FFD36E' },
  { name: 'Users', value: 42, color: '#8EDB8E' },
]

export default function RolesBreakdownDonutChart() {
  return (
    <div className="flex items-center gap-6">
      {/* Donut Chart */}
      <div className="w-[200px] h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={6}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold">100%</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="space-y-3 text-sm">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-md"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text70">
              {item.name}{' '}
              <span className="font-medium text-primaryText">
                {item.value}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
