'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { useSidebar } from './SidebarContext'
import Link from 'next/link'

import {
  DashboardIcon,
  OverviewIcon,
  UsersIcon,
  RolesIcon,
  UserManagementIcon,
  GroupsIcon,
  DepartmentsIcon,
  CompanyIcon,
  LocationsIcon,
  ProjectManagementIcon,
  TaskManagementIcon,
  ServiceDeskIcon,
  AssetManagementIcon,
} from '../Icons'

/* ------------------ Navigation config ------------------ */
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    route: '/dashboard',
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <UserManagementIcon />,
    hasDropdown: true,
    subItems: [
      { id: 'overview', label: 'Overview', icon: <OverviewIcon />, route: '/user-management' },
      { id: 'users', label: 'Users', icon: <UsersIcon className='z-10 text-black' color='black'/>, route: '/user-management/users' },
      { id: 'roles', label: 'Roles', icon: <RolesIcon />, route: '/user-management/roles' },
      { id: 'groups', label: 'Groups', icon: <GroupsIcon />, route: '/user-management/groups' },
      { id: 'departments', label: 'Departments', icon: <DepartmentsIcon />, route: '/user-management/departments' },
      { id: 'organizations', label: 'Organizations', icon: <CompanyIcon />, route: '/user-management/organizations' },
      { id: 'locations', label: 'Locations', icon: <LocationsIcon />, route: '/user-management/locations' },
    ],
  },
  { id: 'project-management', label: 'Project Management', icon: <ProjectManagementIcon />, route: '/projects' },
  { id: 'task-management', label: 'Task Management', icon: <TaskManagementIcon />, route: '/tasks' },
  { id: 'service-desk', label: 'Service Desk', icon: <ServiceDeskIcon />, route: '/service-desk' },
  { id: 'asset-management', label: 'Asset Management', icon: <AssetManagementIcon />, route: '/assets' },
]

/* ------------------ Sidebar Component ------------------ */
export default function Sidebar() {
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen } = useSidebar()
  const [activePage, setActivePage] = useState('dashboard')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const router = useRouter()

  const sidebarVariants = {
    collapsed: { width: 76 },
    expanded: { width: 240 },
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  return (
    <>
      {/* ---------------- Mobile toggle button ---------------- */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* ---------------- Desktop Sidebar ---------------- */}
      <motion.div
        className="hidden lg:flex fixed left-0 top-[72px] z-50 bg-white h-[calc(100vh-72px)] shadow"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        transition={{ duration: 0.25 }}
      >
        <nav className="w-full p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id
              const isOpen = openDropdown === item.id

              return (
                <li key={item.id}>
                  {/* ---------- Main Item ---------- */}
                  <button
                    onMouseEnter={() => {
                      // Prefetch route on hover for better performance
                      if (item.route && !item.hasDropdown) {
                        router.prefetch(item.route)
                      }
                      // Prefetch user-management sub-routes
                      if (item.id === 'user-management') {
                        item.subItems?.forEach(sub => {
                          router.prefetch(sub.route)
                        })
                      }
                    }}
                    onClick={() => {
                      if (!isExpanded) setIsExpanded(true)

                      if (item.hasDropdown) {
                        toggleDropdown(item.id)
                      } else {
                        setActivePage(item.id)
                        router.push(item.route!)
                      }
                    }}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-secondary text-white'
                        : 'text-primaryText hover:bg-lightGreen hover:text-primary'
                    }`}
                  >
                    <div className={`flex items-center ${isExpanded ? '' : 'justify-center w-full'}`}>
                      <span className={`text-[20px] ${isActive ? 'brightness-0 invert' : ''}`}>
                        {item.icon}
                      </span>

                      {isExpanded && (
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      )}
                    </div>

                    {item.hasDropdown && isExpanded && (
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown size={16} />
                      </motion.span>
                    )}
                  </button>

                  {/* ---------- Sub Items ---------- */}
                  <AnimatePresence>
                    {item.hasDropdown && isOpen && isExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-9 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.subItems?.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onMouseEnter={() => {
                                // Prefetch sub-routes on hover
                                router.prefetch(sub.route)
                              }}
                              onClick={() => {
                                setActivePage(sub.id)
                                router.push(sub.route)
                              }}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md w-full text-left text-sm transition-colors ${
                                activePage === sub.id
                                  ? 'bg-secondary text-white'
                                  : 'text-primaryText hover:bg-lightGreen hover:text-primary'
                              }`}
                            >
                              <span className={`text-[16px] ${activePage === sub.id ? 'brightness-0 invert' : ''}`}>
                                {sub.icon}
                              </span>
                              <span>{sub.label}</span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </nav>
      </motion.div>

      {/* ---------------- Mobile Drawer ---------------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[999]"
              onClick={() => setIsMobileOpen(false)}
            />

            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              className="fixed top-0 left-0 h-full w-[240px] bg-white z-[9999] p-4"
            >
              <button
                className="mb-4 p-2 rounded-lg bg-primary text-white"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={18} />
              </button>

              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isOpen = openDropdown === item.id

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (item.hasDropdown) {
                            toggleDropdown(item.id)
                          } else {
                            setActivePage(item.id)
                            router.push(item.route!)
                            setIsMobileOpen(false)
                          }
                        }}
                        className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-primaryText hover:bg-lightGreen"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[20px]">{item.icon}</span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>

                        {item.hasDropdown && (
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                            <ChevronDown size={16} />
                          </motion.span>
                        )}
                      </button>

                      <AnimatePresence>
                        {item.hasDropdown && isOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-9 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.subItems?.map((sub) => (
                              <li key={sub.id}>
                                <button
                                  onClick={() => {
                                    setActivePage(sub.id)
                                    router.push(sub.route)
                                    setIsMobileOpen(false)
                                  }}
                                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-lightGreen"
                                >
                                  <span className="text-[16px]">{sub.icon}</span>
                                  <span>{sub.label}</span>
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
