'use client'

import StatsCard from './StatsCard'
import RecentlyAddedUsers from './RecentlyAddedUsers'
import UserAnalyticsLineChart from './charts/UserAnalyticsLineChart'
import UsersByDepartmentBarChart from './charts/UsersByDepartmentBarChart'
import RolesBreakdownDonutChart from './charts/RolesBreakdownDonutChart'
import { TotalDepartmentsIcon, TotalGroupsIcon, InActiveUserIcon, ActiveUserIcon, TotalUserIcon } from '../Icons'
import { useUserStatistics } from '@/hooks/useUserStatistics'
import LoadingSpinner from '../common/LoadingSpinner'

export default function UserOverview() {
  const { statistics, loading, error } = useUserStatistics()

  return (
    <div className="py-6 space-y-6 bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-primaryText">
            User Management
          </h1>
          <p className="text-sm text-text70">
            Manage users, roles, locations, and access
          </p>
        </div>

        <button className="px-4 py-2 rounded-full border text-sm text-primary border-primary hover:bg-primary hover:text-white transition">
          Export CSV
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">Error loading statistics: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          // Loading state - show spinners for all cards
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm flex justify-center items-center h-24">
              <LoadingSpinner size="small" />
            </div>
          ))
        ) : (
          // Real data state
          <>
            <StatsCard
              title="Total Users"
              value={statistics?.totalUsers?.toString() || '0'}
              change="+10%"
              icon={TotalUserIcon}
            />

            <StatsCard
              title="Active Users"
              value={statistics?.activeUsers?.toString() || '0'}
              change="+10%"
              icon={ActiveUserIcon}
            />

            <StatsCard
              title="Inactive Users"
              value={statistics?.inactiveUsers?.toString() || '0'}
              change="+10%"
              icon={InActiveUserIcon}
            />

            <StatsCard
              title="Total Groups"
              value={statistics?.totalGroups?.toString() || '0'}
              icon={TotalGroupsIcon}
            />

            <StatsCard
              title="Total Departments"
              value={statistics?.totalDepartments?.toString() || '0'}
              icon={TotalDepartmentsIcon}
            />
          </>
        )}
      </div>


      {/* Charts Section (UI placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <UserAnalyticsLineChart />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <UsersByDepartmentBarChart />

        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentlyAddedUsers />

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-xl mb-4">Roles Breakdown</h3>
          <RolesBreakdownDonutChart />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-xl">Company's</h3>
          <ul className="space-y-3 text-sm">
            {[
              ['Tech Innovators Co.', 84],
              ['Creative Minds Inc.', 72],
              ['Bright Futures LLC', 58],
              ['Visionary Solutions Ltd.', 67],
              ['NextGen Technologies', 80],
            ].map(([name, count]) => (
              <li key={name} className="flex justify-between">
                <span className="text-text70">{name}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
