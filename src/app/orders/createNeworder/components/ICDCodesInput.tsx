import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getIcdCodes } from '../services/ordersService'
import { X } from 'lucide-react'

interface ICDCodesInputProps {
    value: string[]
    onChange: (codes: string[]) => void
    error?: string | null
    touched?: boolean
}

const ICDCodesInput: React.FC<ICDCodesInputProps> = ({ value = [], onChange, error, touched }) => {
    const [icdList, setIcdList] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    // Fetch ICD codes on mount
    useEffect(() => {
        let mounted = true
        const fetchIcd = async () => {
            setLoading(true)
            try {
                const res = await getIcdCodes()
                if (mounted) setIcdList(res || [])
            } catch (err: any) {
                if (mounted) {
                    setFetchError(err?.message || 'Failed to fetch ICD codes')
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchIcd()
        return () => { mounted = false }
    }, [])

    // Filter and limit results for performance
    const filteredList = useMemo(() => {
        if (!search.trim()) return icdList.slice(0, 50) // Show top 50 if no search
        const q = search.toLowerCase()
        // Filter and take top 50 matches
        const matches = []
        for (const item of icdList) {
            const code = String(item.icd_code ?? item.code ?? '').toLowerCase()
            const desc = String(item.description ?? item.name ?? '').toLowerCase()
            if (code.includes(q) || desc.includes(q)) {
                matches.push(item)
                if (matches.length >= 50) break // Performance limit
            }
        }
        return matches
    }, [icdList, search])

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleSelect = (code: string) => {
        const isSelected = value.includes(code)
        let updated: string[]
        if (isSelected) {
            updated = value.filter((c) => c !== code)
        } else {
            updated = [...value, code]
        }
        onChange(updated)
        setSearch('')
        // Keep dropdown open for multi-selection
    }

    return (
        <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
                ICD Codes <span className="text-red-500">*</span>
            </label>

            <div className="relative" ref={dropdownRef}>
                <input
                    type="text"
                    placeholder="Search ICD codes"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className={`w-full rounded-2xl border ${touched && error ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600`}
                    autoComplete="off"
                />

                {showDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto scrollbar-custom">
                        {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />}
                        {fetchError && <div className="px-4 py-2 text-xs text-red-500">{fetchError}</div>}

                        {!loading && !fetchError && filteredList.length === 0 && (
                            <div className="px-4 py-2 text-xs text-gray-500">No ICDs found</div>
                        )}

                        {!loading && !fetchError && filteredList.map((item, index) => {
                            const code = String(item.icd_code ?? item.code ?? '').trim()
                            const desc = String(item.description ?? item.name ?? '')
                            const isSelected = value.includes(code)

                            return (
                                <div
                                    key={`${code}-${index}`}
                                    onClick={() => handleSelect(code)}
                                    className={`px-4 py-2 text-sm cursor-pointer border-b last:border-0 flex items-center justify-between ${isSelected ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{code}</span>
                                        {desc && <span className="text-xs text-gray-500">{desc}</span>}
                                    </div>
                                    {isSelected && <span className="text-xs font-semibold">Selected</span>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {touched && error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    )
}

export default ICDCodesInput
