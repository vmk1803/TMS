'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { RoleBreakdown } from '@/types/user'
import LoadingSpinner from '../../common/LoadingSpinner'

interface RolesBreakdownDonutChartProps {
  roleBreakdown?: RoleBreakdown[];
  loading?: boolean;
}

// Predefined colors for consistency
const CHART_COLORS = [
  '#A5A3FF',
  '#FFAD99', 
  '#FFD36E',
  '#8EDB8E',
  '#FF9AA2',
  '#B5EAD7',
  '#C7CEEA',
  '#FFDAC1'
];

export default function RolesBreakdownDonutChart({ roleBreakdown = [], loading = false }: RolesBreakdownDonutChartProps) {
  // Transform roleBreakdown data for the chart
  const chartData = roleBreakdown.map((role, index) => ({
    name: role.roleName,
    value: role.percentage,
    count: role.userCount,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        No role data available
      </div>
    );
  }
  return (
    <div className="flex items-center gap-6">
      {/* Donut Chart */}
      <div className="w-[200px] h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={6}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold">
            {chartData.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="space-y-3 text-sm">
        {chartData.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-md"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text70">
              {item.name}{' '}
              <span className="font-medium text-primaryText">
                {item.value}% ({item.count})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
