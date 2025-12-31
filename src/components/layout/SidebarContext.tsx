'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'

const SidebarContext = createContext({
  isExpanded: false,
  setIsExpanded: (value: boolean) => {},
  isMobileOpen: false,
  setIsMobileOpen: (value: boolean) => {},
  toggleSidebar: () => {},
  handleSidebarHover: (isHovering: boolean) => {},
  isMobile: false
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect screen size
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 1024)
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev)
    } else {
      setIsExpanded(prev => !prev)
    }
  }

  const handleSidebarHover = (isHovering: boolean) => {
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
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <SidebarContext.Provider value={{
      isExpanded,
      setIsExpanded,
      isMobileOpen,
      setIsMobileOpen,
      toggleSidebar,
      handleSidebarHover,
      isMobile
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
