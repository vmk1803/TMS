'use client'

import { useState } from 'react'
import StatsCard from './StatsCard'
import RecentlyAddedUsers from './RecentlyAddedUsers'
import UserAnalyticsLineChart from './charts/UserAnalyticsLineChart'
import UsersByDepartmentBarChart from './charts/UsersByDepartmentBarChart'
import RolesBreakdownDonutChart from './charts/RolesBreakdownDonutChart'
import YearSelector from '../common/YearSelector'
import { TotalDepartmentsIcon, TotalGroupsIcon, InActiveUserIcon, ActiveUserIcon, TotalUserIcon } from '../Icons'
import { useUserStatistics } from '@/hooks/useUserStatistics'
import { useRolesBreakdown } from '@/hooks/useRolesBreakdown'
import { useOrganizationsOverview } from '@/hooks/useOrganizationsOverview'
import LoadingSpinner from '../common/LoadingSpinner'
import { exportToCSV } from '@/utils/exportToCSV'

export default function UserOverview() {
  // Separate state for each section
  const [rolesYear, setRolesYear] = useState<number | undefined>(undefined)
  const [orgsYear, setOrgsYear] = useState<number | undefined>(undefined)

  // Separate hooks for each section
  const { statistics, loading: statsLoading, error: statsError } = useUserStatistics()
  const { data: rolesData, loading: rolesLoading, error: rolesError, updateFilters: updateRolesFilters } = useRolesBreakdown({
    year: rolesYear
  })
  const { data: orgsData, loading: orgsLoading, error: orgsError, updateFilters: updateOrgsFilters } = useOrganizationsOverview({
    year: orgsYear
  })

  const handleRolesYearChange = (year: number | undefined) => {
    setRolesYear(year)
    updateRolesFilters({ year })
  }

  const handleOrgsYearChange = (year: number | undefined) => {
    setOrgsYear(year)
    updateOrgsFilters({ year })
  }

  const handleExportCSV = () => {
    if (!statistics) {
      return
    }

    // Prepare comprehensive user statistics data for CSV export
    const exportData = [
      {
        "Metric": "Total Users",
        "Count": statistics.totalUsers || 0,
        "Description": "All users in the system"
      },
      {
        "Metric": "Active Users",
        "Count": statistics.activeUsers || 0,
        "Description": "Currently active users"
      },
      {
        "Metric": "Inactive Users",
        "Count": statistics.inactiveUsers || 0,
        "Description": "Currently inactive users"
      },
      {
        "Metric": "Total Groups",
        "Count": statistics.totalGroups || 0,
        "Description": "Number of user groups"
      },
      {
        "Metric": "Total Departments",
        "Count": statistics.totalDepartments || 0,
        "Description": "Number of departments"
      }
    ]

    // Add roles breakdown data if available
    if (rolesData?.roleBreakdown?.length) {
      rolesData.roleBreakdown.forEach(role => {
        exportData.push({
          "Metric": `Role - ${role.roleName}`,
          "Count": role.userCount,
          "Description": `${role.percentage}% of total users`
        })
      })
    }

    // Add organizations overview data if available
    if (orgsData?.organizationsOverview?.length) {
      orgsData.organizationsOverview.forEach(org => {
        exportData.push({
          "Metric": `Organization - ${org.organizationName}`,
          "Count": org.userCount,
          "Description": "Users in this organization"
        })
      })
    }

    // Add recently added users summary
    if (statistics.recentlyAddedUsers?.length) {
      exportData.push({
        "Metric": "Recently Added Users (Last 30 Days)",
        "Count": statistics.recentlyAddedUsers.length,
        "Description": "New users added in the last 30 days"
      })
    }

    exportToCSV(exportData, "user_management_statistics")
  }

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

        <button
          className="px-4 py-2 rounded-full border text-sm text-primary border-primary hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportCSV}
          disabled={statsLoading || !statistics}
        >
          Export CSV
        </button>
      </div>

      {/* Error Banner */}
      {(statsError || rolesError || orgsError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {statsError && <p className="text-red-600 text-sm">Stats Error: {statsError}</p>}
          {rolesError && <p className="text-red-600 text-sm">Roles Error: {rolesError}</p>}
          {orgsError && <p className="text-red-600 text-sm">Organizations Error: {orgsError}</p>}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsLoading ? (
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
              change={statistics?.changeMetrics?.totalUsersChange !== undefined 
                ? `${statistics.changeMetrics.totalUsersChange > 0 ? '+' : ''}${statistics.changeMetrics.totalUsersChange}%`
                : undefined
              }
              icon={TotalUserIcon}
            />

            <StatsCard
              title="Active Users"
              value={statistics?.activeUsers?.toString() || '0'}
              change={statistics?.changeMetrics?.activeUsersChange !== undefined 
                ? `${statistics.changeMetrics.activeUsersChange > 0 ? '+' : ''}${statistics.changeMetrics.activeUsersChange}%`
                : undefined
              }
              icon={ActiveUserIcon}
            />

            <StatsCard
              title="Inactive Users"
              value={statistics?.inactiveUsers?.toString() || '0'}
              change={statistics?.changeMetrics?.inactiveUsersChange !== undefined 
                ? `${statistics.changeMetrics.inactiveUsersChange > 0 ? '+' : ''}${statistics.changeMetrics.inactiveUsersChange}%`
                : undefined
              }
              icon={InActiveUserIcon}
            />

            <StatsCard
              title="Total Groups"
              value={statistics?.totalGroups?.toString() || '0'}
              change={statistics?.changeMetrics?.totalGroupsChange !== undefined 
                ? `${statistics.changeMetrics.totalGroupsChange > 0 ? '+' : ''}${statistics.changeMetrics.totalGroupsChange}%`
                : undefined
              }
              icon={TotalGroupsIcon}
            />

            <StatsCard
              title="Total Departments"
              value={statistics?.totalDepartments?.toString() || '0'}
              change={statistics?.changeMetrics?.totalDepartmentsChange !== undefined 
                ? `${statistics.changeMetrics.totalDepartmentsChange > 0 ? '+' : ''}${statistics.changeMetrics.totalDepartmentsChange}%`
                : undefined
              }
              icon={TotalDepartmentsIcon}
            />
          </>
        )}
      </div>


      {/* Charts Section */}
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
        <RecentlyAddedUsers recentUsers={statistics?.recentlyAddedUsers || []} loading={statsLoading} />

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xl">Roles Breakdown</h3>
            <YearSelector
              value={rolesYear}
              onChange={handleRolesYearChange}
              disabled={rolesLoading}
            />
          </div>
          <RolesBreakdownDonutChart roleBreakdown={rolesData?.roleBreakdown || []} loading={rolesLoading} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xl">Organizations</h3>
            <YearSelector
              value={orgsYear}
              onChange={handleOrgsYearChange}
              disabled={orgsLoading}
            />
          </div>
          {orgsLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <ul className="space-y-3 text-sm">
              {(orgsData?.organizationsOverview || []).slice(0, 5).map(org => (
                <li key={org.organizationId} className="flex justify-between">
                  <span className="text-text70">{org.organizationName}</span>
                  <span className="font-medium">{org.userCount}</span>
                </li>
              ))}
              {(!orgsData?.organizationsOverview || orgsData.organizationsOverview.length === 0) && (
                <li className="text-text70 text-center py-4">No organizations found</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
