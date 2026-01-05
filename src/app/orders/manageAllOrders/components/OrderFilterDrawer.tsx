'use client'
import React, { use, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import AllDatesPicker from '@/components/common/AllDatesPicker'
import DateOfBirthPicker from '@/components/common/DateOfBirthPicker'
import { getAllPartners } from '../services/getAllOrderService'

interface OrderFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (drawerFilters: Record<string, any>) => void
  onClear?: () => void
}

const OrderFilterDrawer: React.FC<OrderFilterDrawerProps> = ({ isOpen, onClose, onApply, onClear }) => {
  // store all drawer selections here until Apply is pressed
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [partners, setPartners] = useState<any[]>([])
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [dosFrom, setDosFrom] = useState<string | null>(null)
  const [dosTo, setDosTo] = useState<string | null>(null)
  const [createdFrom, setCreatedFrom] = useState<string | null>(null)
  const [createdTo, setCreatedTo] = useState<string | null>(null)
  const [applyAttempted, setApplyAttempted] = useState(false)

  // Reset validation visibility when the drawer opens or when the user edits date fields
  useEffect(() => {
    if (isOpen) setApplyAttempted(false)
  }, [isOpen])

  useEffect(() => {
    // hide validations when user changes any date input
    setApplyAttempted(false)
  }, [dosFrom, dosTo, createdFrom, createdTo])

  // Toggle filter buttons — store as booleans in activeFilters object
  const handleToggle = (filter: string) => {
    setActiveFilters((prev) => {
      const nextVal = !prev[filter]
      const next = { ...prev, [filter]: nextVal }
      // If One Week Visibility is being enabled, clear explicit date inputs
      if (filter === 'One Week Visibility' && nextVal) {
        setDosFrom(null)
        setDosTo(null)
        setCreatedFrom(null)
        setCreatedTo(null)
      }
      return next
    })
  }

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
  }, [isOpen])

  useEffect(() => {
    async function fetchPartners() {
      try {
        const partnerData = await getAllPartners({
          page: 1,
          pageSize: 100
        });
        setPartners(partnerData.data || []);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Ref for click-away handling for the client dropdown
  const clientDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!clientDropdownRef.current) return
      const target = e.target as Node
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // onClientClear and onClientSelect only update local drawer state
  function onClientClear() {
    setSelectedClient(null)
    setSearchText("")
    setOpen(false)
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next['partner_name']
      return next
    })
    // notify parent that partner_name filter is removed
    if (onApply) onApply(buildFormattedFilters())
  }

  function onClientSelect(client: any) {
    setSelectedClient(client)
    setActiveFilters((prev) => ({ ...prev, partner_name: client.name }))
  }

  function buildFormattedFilters() {
    const out: Record<string, any> = {}
    if (selectedClient) {
      out.partner_name = selectedClient.name
    }
    // Convert MM-DD-YYYY (AllDatesPicker) to ISO YYYY-MM-DD for API
    const toISO = (mmddyyyy: string | null) => {
      if (!mmddyyyy || mmddyyyy.length !== 10) return null
      const [mm, dd, yyyy] = mmddyyyy.split('-')
      if (!mm || !dd || !yyyy) return null
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    }

    const dosFromISO = toISO(dosFrom)
    const dosToISO = toISO(dosTo)
    const createdFromISO = toISO(createdFrom)
    const createdToISO = toISO(createdTo)

    if (dosFromISO) out.dos_from = dosFromISO
    if (dosToISO) out.dos_to = dosToISO
    if (createdFromISO) out.created_from = createdFromISO
    if (createdToISO) out.created_to = createdToISO

    if (activeFilters['One Week Visibility']) {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      out.created_from = oneWeekAgo.toISOString().split('T')[0]
      out.created_to = new Date().toISOString().split('T')[0]
    }

    return out
  }

  // If any date is selected, 'One Week Visibility' should be disabled
  const anyDateSelected = Boolean(dosFrom || dosTo || createdFrom || createdTo)
  // Helper: parse MM-DD-YYYY to Date (or null)
  const parseMMDDYYYY = (s: string | null) => {
    if (!s || s.length !== 10) return null
    const parts = s.split('-')
    if (parts.length !== 3) return null
    const mm = Number(parts[0])
    const dd = Number(parts[1])
    const yyyy = Number(parts[2])
    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return null
    return new Date(yyyy, mm - 1, dd)
  }

  const dosFromDate = parseMMDDYYYY(dosFrom)
  const dosToDate = parseMMDDYYYY(dosTo)
  const createdFromDate = parseMMDDYYYY(createdFrom)
  const createdToDate = parseMMDDYYYY(createdTo)

  const dosInvalid = Boolean(dosFromDate && dosToDate && dosFromDate > dosToDate)
  const createdInvalid = Boolean(createdFromDate && createdToDate && createdFromDate > createdToDate)
  // New: require both dates in a pair for the filter to be considered valid
  const dosPairIncomplete = Boolean((dosFrom && !dosTo) || (!dosFrom && dosTo))
  const createdPairIncomplete = Boolean((createdFrom && !createdTo) || (!createdFrom && createdTo))
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-[9999] flex flex-col shadow-2xl rounded-l-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-500 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-custom p-6 space-y-5">
              {/* --- Date of Service --- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Date of Service From
                  </label>
                  <div className="relative">
                    <AllDatesPicker
                      value={dosFrom}
                      onChange={(v) => setDosFrom(v)}
                      placeholder="MM-DD-YYYY"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Date of Service To
                  </label>
                  <div className="relative">
                    <AllDatesPicker
                      value={dosTo}
                      onChange={(v) => setDosTo(v)}
                      placeholder="MM-DD-YYYY"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              {(applyAttempted && dosInvalid) && (
                <div className="text-xs text-red-500">From Date cannot be greater than To Date.</div>
              )}
              {(applyAttempted && dosPairIncomplete) && (
                <div className="text-xs text-red-600">Please select both From and To Dates.</div>
              )}

              {/* --- Created Date --- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Created Date From
                  </label>
                  <div className="relative">
                    <DateOfBirthPicker
                      value={createdFrom}
                      onChange={(v) => setCreatedFrom(v)}
                      placeholder="MM-DD-YYYY"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Created Date To
                  </label>
                  <div className="relative">
                    <DateOfBirthPicker
                      value={createdTo}
                      onChange={(v) => setCreatedTo(v)}
                      placeholder="MM-DD-YYYY"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              {(applyAttempted && createdInvalid) && (
                <div className="text-xs text-red-500">From Date cannot be greater than To Date.</div>
              )}
              {(applyAttempted && createdPairIncomplete) && (
                <div className="text-xs text-red-500">Please select both From and To Dates.</div>
              )}

              {/* --- Client Dropdown (Searchable) --- */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Client
                </label>

                {/* Local dropdown state */}
                {/* (Add these states inside your component — see below) */}

                <div className="w-full flex items-center justify-between gap-2">
                  <div
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 bg-white flex justify-between items-center cursor-pointer"
                    onClick={() => setOpen(!open)}
                  >
                    <span>{selectedClient?.name || "Select Client"}</span>
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  </div>

                  {/* Clear selected client button */}
                  {selectedClient && (
                    <button
                      aria-label="Clear selected client"
                      onClick={() => {
                        onClientClear()
                      }}
                      className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 w-8 h-8"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                {open && (
                  <div ref={clientDropdownRef} className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50">

                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto scrollbar-custom">
                      {filteredPartners.length > 0 ? (
                        filteredPartners.map((partner) => (
                          <div
                            key={partner.id}
                            onClick={() => {
                              onClientSelect(partner)
                              setSelectedClient(partner);
                              setOpen(false);
                            }}
                            className="px-4 py-2 text-sm hover:bg-green-50 cursor-pointer"
                          >
                            {partner.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No results</div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {/* --- Filter Toggle Buttons --- */}
              {/* <div className="flex flex-wrap gap-3"> */}
                {/* {[
                  'Client Orders',
                  'One Week Visibility',
                ].map((filter) => {
                  const isOneWeek = filter === 'One Week Visibility'
                  const disabled = isOneWeek && anyDateSelected
                  return (
                    <button
                      key={filter}
                      onClick={() => { if (!disabled) handleToggle(filter) }}
                      disabled={disabled}
                      className={`px-5 py-2 text-sm rounded-full font-medium border transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : (activeFilters[filter]
                          ? 'bg-green-600 text-white border-green-600 shadow-sm'
                          : 'border-gray-300 text-gray-700 hover:bg-green-50')
                        }`}
                    >
                      {filter}
                    </button>
                  )
                })} */}
                {/* helper message when One Week is disabled */}
                {/* {anyDateSelected && (
                <div className="text-xs text-gray-500 mt-2">One Week Visibility is disabled when specific dates are selected.</div>
              )} */}
              {/* </div> */}
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-between gap-3 p-4 border-t border-gray-200 bg-white sticky bottom-0 rounded-b-2xl">
              <button
                onClick={() => {
                  // reset local drawer selections only
                  setSearchText("")
                  setSelectedClient(null)
                  setActiveFilters({})
                  setDosFrom(null)
                  setDosTo(null)
                  setCreatedFrom(null)
                  setCreatedTo(null)
                  setApplyAttempted(false)
                  onClear && onClear()
                  onClose()
                }}
                className="flex-1 border border-gray-300 rounded-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                Clear Filter
              </button>
              <button
                onClick={() => {
                  setApplyAttempted(true)
                  if (dosInvalid || createdInvalid || dosPairIncomplete || createdPairIncomplete) {
                    return
                  }
                  const formatted = buildFormattedFilters()
                  if (onApply) onApply(formatted)
                  onClose()
                }}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-2 text-sm font-medium transition-all`}
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default OrderFilterDrawer
