import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDebouncedSearchOptions {
  debounceDelay?: number
  minSearchLength?: number
}

interface UseDebouncedSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  isDebouncing: boolean
  clearSearch: () => void
}

export const useDebouncedSearch = (
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn => {
  const { debounceDelay = 1000, minSearchLength = 0 } = options

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Debounce effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set debouncing state immediately when user starts typing
    if (searchQuery.length > 0) {
      setIsDebouncing(true)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setIsDebouncing(false)
    }, debounceDelay)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, debounceDelay])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setIsDebouncing(false)
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing,
    clearSearch
  }
}
