'use client'
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface SidebarContextType {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
  toggleSidebar: () => void
  handleSidebarHover: (isHovering: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false,
  setIsExpanded: (value: boolean) => {},
  isMobileOpen: false,
  setIsMobileOpen: (value: boolean) => {},
  toggleSidebar: () => {},
  handleSidebarHover: (isHovering: boolean) => {},
  isMobile: false
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized resize handler to prevent recreation on every render
  const checkSize = useCallback(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    // Auto-close mobile sidebar when switching to desktop
    if (!mobile) {
      setIsMobileOpen(false)
    }
  }, [])

  // Detect screen size with throttled resize listener
  useEffect(() => {
    checkSize()
    let resizeTimeout: NodeJS.Timeout

    const throttledResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkSize, 100) // Throttle to 100ms
    }

    window.addEventListener('resize', throttledResize)
    return () => {
      window.removeEventListener('resize', throttledResize)
      clearTimeout(resizeTimeout)
    }
  }, [checkSize])

  // Memoized toggle function
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev)
    } else {
      setIsExpanded(prev => !prev)
    }
  }, [isMobile])

  // Memoized hover handler
  const handleSidebarHover = useCallback((isHovering: boolean) => {
    if (isMobile) return // Don't apply hover functionality on mobile

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (isHovering) {
      // Expand immediately on hover
      setIsExpanded(true)
    } else {
      // Collapse after a short delay when mouse leaves
      hoverTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false)
      }, 300) // 300ms delay before closing
    }
  }, [isMobile])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isExpanded,
    setIsExpanded,
    isMobileOpen,
    setIsMobileOpen,
    toggleSidebar,
    handleSidebarHover,
    isMobile
  }), [isExpanded, isMobileOpen, toggleSidebar, handleSidebarHover, isMobile])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
