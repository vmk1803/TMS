"use client";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState, useMemo, useLayoutEffect, useCallback } from "react";
import { Eye, Pencil, RefreshCw, FileText, Calendar, XCircle, Printer, X, Check, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from "../../../../utils/filterPersistence";
import ReAssignTechnicianModal from "../../../../components/common/ReAssignTechnicianModal";
import NotesModal from "../../actions/components/NotesModal";
import ScheduleNotesModal from "../../actions/components/ScheduleNotesModal";
import CancelOrderModal from "../../actions/components/CancelOrderModal";
import { FASTING_OPTIONS_ALL_ORDERS, ORDER_TYPES_ALL_ORDERS, STATUS_OPTIONS_ALL_ORDERS, URGENCY_OPTIONS_ALL_ORDERS } from "../../../../lib/orderEnums";
import Tooltip from "@/components/common/ToolTip";
import DateOfBirthPicker from "@/components/common/DateOfBirthPicker";
import AllDatesPicker from "@/components/common/AllDatesPicker";
import Toast from "@/components/common/Toast";
import { hasFullAccess } from "../../../../utils/rbac";
import { printRequisitionForm } from "../../actions/services/orderActionService";
import StatusDropdown from "@/components/common/StatusDropdown";


const columns = [
  { key: "checkbox", label: "", fixed: "left1", width: "40px" },
  { key: "actions", label: "Actions", fixed: "left2", width: "76px", },
  { key: "phlebio_order_id", label: "Order Number", fixed: "left3", width: "200px" },
  { key: "patient_name", label: "Patient Name", width: "200px" },
  { key: "date_of_birth", label: "DOB", width: "180px" },
  { key: "lis_order", label: "EMR / Labsquire Order", width: "200px" },
  { key: "order_type", label: "Order Type" },
  { key: "urgency", label: "Urgency" },
  { key: "fasting", label: "Fasting" },
  { key: "tat", label: "TAT", width: "110px" },
  { key: "test_name", label: "Lab Tests", width: "250px" },
  { key: "partner_name", label: "Ordering Facility", width: "250px" },
  { key: "physician_name", label: "Physician", width: "250px" },
  { key: "created_at", label: "Order Date", width: "180px" },
  { key: "date_of_service", label: "Service Date", width: "180px" },
  { key: "service_address", label: "Service Address", width: "300px" },
  { key: "technician", label: "Technician", width: "170px" },
  { key: "adminNotes", label: "Admin Notes", width: "200px" },
  { key: "technicianNotes", label: "Technician Notes", width: "200px" },
  { key: "status", label: "Status", fixed: "right", width: "200px" },
];

// All available actions
const ALL_ACTIONS = [
  { label: 'View Order', icon: Eye, link: '/orders/view' },
  { label: 'Edit Order', icon: Pencil },
  { label: 'Reassign Order', icon: RefreshCw },
  { label: 'Reorder', icon: RefreshCw },
  { label: 'Admin Notes', icon: FileText },
  { label: 'Technician Notes', icon: Calendar },
  { label: 'Cancel', icon: XCircle },
  { label: 'Print Requisition', icon: Printer },
]

interface DataTableProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  data: any[];
  loading: boolean;
  totalPages: number;
  limit: number;
  total: number;
  filters: Record<string, any>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onSelectionChange?: (orderGuids: string[]) => void;
  clearSelectionKey?: number;
  onRefresh?: () => void;
}

function DataTable({
  page,
  setPage,
  pageSize,
  setPageSize,
  data,
  loading,
  totalPages,
  limit,
  total,
  filters,
  setFilters,
  onSelectionChange,
  clearSelectionKey,
  onRefresh,
}: DataTableProps) {
  // ---------- Refs & dropdown positioning ----------
  // typed specifically as HTMLButtonElement | null so callback ref typings match
  const triggerRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width?: number } | null>(null)
  // -------------------------------------------------

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [selectedOrderGuid, setSelectedOrderGuid] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<{ id: string, date: string, orderGuid?: string, type?: string } | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [printingRequisition, setPrintingRequisition] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const handleSuccess = (message: string) => {
    setToastType('success');
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleError = (message: string) => {
    setToastType('error');
    setToastMessage(message);
    setToastOpen(true);
  };

  const handlePrintRequisition = async (orderGuid: string) => {
    try {
      setPrintingRequisition(orderGuid);
      const result = await printRequisitionForm(orderGuid);
      // Open the signed URL in a new tab for viewing (force inline display)
      const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(result.signedUrl)}`;
      window.open(viewerUrl, '_blank');
      handleSuccess('Requisition form opened in new tab');
    } catch (error: any) {
      handleError(error.message || 'Failed to print requisition form');
    } finally {
      setPrintingRequisition(null);
    }
  };

  const [selectedGuids, setSelectedGuids] = useState<string[]>([])

  const orders = Array.isArray(data) ? data : []

  // Filter actions based on user permissions
  const ACTIONS = useMemo(() => {
    const fullAccess = hasFullAccess();

    if (fullAccess) {
      // LAB SUPER ADMIN sees all actions
      return ALL_ACTIONS;
    } else {
      // LAB ADMIN and TECHNICIAN only see View and Print
      return ALL_ACTIONS.filter(action =>
        action.label === 'View Order' || action.label === 'Print Requisition'
      );
    }
  }, []);

  const updateSelection = (next: string[]) => {
    setSelectedGuids(next)
    if (onSelectionChange) {
      onSelectionChange(next)
    }
  }

  const isRowSelected = (guid?: string | null) => {
    if (!guid) return false
    return selectedGuids.includes(guid)
  }

  const areAllVisibleSelected = orders.length > 0 && orders.every((row: any) => row.order_guid && selectedGuids.includes(row.order_guid))

  useEffect(() => {
    if (typeof clearSelectionKey !== 'undefined') {
      updateSelection([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSelectionKey])

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
      // Check if click is outside both the status dropdown and its button
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node) &&
        statusButtonRef.current &&
        !statusButtonRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []);

  // Get the status from URL to determine if we're on Pending/Restricted section.
  // Support both `status` and `statuses` query keys (some parts of the app use `statuses`).
  const rawUrlStatus = searchParams?.get('status') ?? searchParams?.get('statuses') ?? null
  const urlStatus = rawUrlStatus ? String(rawUrlStatus).split(',')[0].toUpperCase().trim() : null
  
  // Track sidebar navigation - if coming directly from sidebar Pending/Rejected
  useEffect(() => {
    if (urlStatus === 'PENDING' || urlStatus === 'REJECTED') {
      // Only mark as sidebar-only if no other filters present
      const hasOtherParams = Array.from(searchParams?.entries() || []).some(([key]) => 
        key !== 'status' && key !== 'page' && key !== 'pageSize'
      )
      if (!hasOtherParams) {
        sessionStorage.setItem('restrictStatus', 'true')
      }
    } else {
      sessionStorage.removeItem('restrictStatus')
    }
  }, [urlStatus, searchParams])
  
  const isRestrictedSection = typeof window !== 'undefined' && sessionStorage.getItem('restrictStatus') === 'true'

  // Initialize search state from URL parameters
  const filterKeys = [
    'phlebio_order_id', 'patient_name', 'date_of_birth', 'lis_order', 'order_type',
    'urgency', 'fasting', 'test_name', 'partner_name',
    'physician_name', 'created_at', 'date_of_service', 'service_address',
    'technician', 'lastServicedBy', 'adminNotes',
    'technicianNotes', 'statuses'
  ]

  const [search, setSearch] = useState<any>(() => {
    const urlFilters = searchParamsToFilters(searchParams, filterKeys)
    return {
      phlebio_order_id: urlFilters.phlebio_order_id || "",
      patient_name: urlFilters.patient_name?.toLowerCase() || "",
      date_of_birth: urlFilters.date_of_birth || "",
      lis_order: urlFilters.lis_order || "",
      order_type: urlFilters.order_type || "",
      urgency: urlFilters.urgency || "",
      fasting: urlFilters.fasting || "",
      test_name: urlFilters.test_name || "",
      partner_name: urlFilters.partner_name || "",
      physician_name: urlFilters.physician_name || "",
      created_at: urlFilters.created_at || "",
      date_of_service: urlFilters.date_of_service || "",
      service_address: urlFilters.service_address || "",
      technician: urlFilters.technician || "",
      lastServicedBy: urlFilters.lastServicedBy || "",
      adminNotes: urlFilters.adminNotes || "",
      technicianNotes: urlFilters.technicianNotes || "",
      status: urlFilters.statuses ? urlFilters.statuses.split(',') : [],
    }
  });

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const statusButtonRef = useRef<HTMLButtonElement>(null)
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  // Update URL when search filters change (with debounce)
  const DEBOUNCE_MS = 300
  useEffect(() => {
    const id = setTimeout(() => {
      // Convert status array to comma-separated string for URL
      const urlFilters = { ...search }
      if (search.status && search.status.length > 0) {
        urlFilters.statuses = search.status.join(',')
      }
      delete urlFilters.status; // Remove array version

      updateUrlWithFilters(router, pathname, urlFilters, page, pageSize)
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search, router, pathname, page, pageSize])

  // Auto-select status when on Pending/Rejected sections
  useEffect(() => {
    if (isRestrictedSection && urlStatus) {
      // Only update if the status is not already set correctly
      if (!search.status.includes(urlStatus)) {
        setSearch((prev: any) => ({ ...prev, status: [urlStatus] }))
      }
    } else if (!isRestrictedSection && urlStatus === 'ALL-ORDERS') {
      // Clear status filter when on All Orders section
      if (search.status.length > 0) {
        setSearch((prev: any) => ({ ...prev, status: [] }))
      }
    }
  }, [urlStatus, isRestrictedSection])

  // helper to update both local input state and server filters by removing the empty values
  const updateFilter = (key: string, value: any) => {
    setSearch((prev: any) => ({ ...prev, [key]: value }))
    setFilters((prev: Record<string, any>) => {
      const next = { ...(prev || {}) }
      if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete next[key]
        // For status field, also remove 'statuses' key when clearing
        if (key === 'status') {
          delete next['statuses']
        }
      } else {
        // For status field, use 'statuses' key when it's an array
        if (key === 'status' && Array.isArray(value) && value.length > 0) {
          delete next['status']
          next['statuses'] = value
        } else {
          next[key] = value
        }
      }
      return next
    })
    // Don't reset page here - let the URL handle pagination state
  }

  // If external `filters` prop changes (e.g., from a filter drawer), reset page to 1
  const prevFiltersRef = React.useRef<Record<string, any> | null>(null)
  useEffect(() => {
    const prev = prevFiltersRef.current || {}
    const curr = filters || {}
    let shouldReset = false

    // If any key in curr is non-empty and was empty or missing before, reset
    for (const key of Object.keys(curr)) {
      const prevVal = prev[key]
      const currVal = curr[key]
      const prevEmpty = prevVal === undefined || prevVal === null || prevVal === '' || (Array.isArray(prevVal) && prevVal.length === 0)
      const currEmpty = currVal === undefined || currVal === null || currVal === '' || (Array.isArray(currVal) && currVal.length === 0)
      if (prevEmpty && !currEmpty) {
        shouldReset = true
        break
      }
    }

    if (shouldReset) {
      // Don't reset page - let the URL handle pagination state
    }
    prevFiltersRef.current = { ...curr }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getSelectOptions = (key: string) => {
    switch (key) {
      case "order_type": return ORDER_TYPES_ALL_ORDERS;
      case "urgency": return URGENCY_OPTIONS_ALL_ORDERS;
      case "fasting": return FASTING_OPTIONS_ALL_ORDERS;
      default: return [];
    }
  };

  const pageWindow = 1;
  const makePages = () => {
    const pages: (number | string)[] = []
    const add = (p: number | string) => pages.push(p)
    const first = 1
    const last = totalPages
    const start = Math.max(first, page - pageWindow)
    const end = Math.min(last, page + pageWindow)
    add(first)
    if (start > first + 1) add('…')
    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) add(p)
    }
    if (end < last - 1) add('…')
    if (last > first) add(last)
    return pages
  }

  const formatUTCDateOnly = (d: any) => {
    if (!d) return "--";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "--";

    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const yyyy = date.getUTCFullYear();

    return `${mm}-${dd}-${yyyy}`;
  };

  // ---------- NEW: compute & set dropdown position (flip & clamp) ----------
  const computeAndSetPosition = useCallback((triggerEl: HTMLButtonElement | null) => {
    if (!triggerEl) return;
    const triggerRect = triggerEl.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const dd = dropdownRef.current;
    // fallback size estimates (w-56 ~ 224). adjust if you use different width.
    const ddWidth = dd ? dd.offsetWidth : 224;
    const ddHeight = dd ? dd.offsetHeight : 220;

    const space = {
      top: triggerRect.top,
      bottom: viewportH - triggerRect.bottom,
      left: triggerRect.left,
      right: viewportW - triggerRect.right,
    };

    // Choose vertical placement
    let top = 0;
    if (space.bottom >= ddHeight + 8) {
      // place below
      top = triggerRect.bottom + 6;
    } else if (space.top >= ddHeight + 8) {
      // place above
      top = triggerRect.top - ddHeight - 6;
    } else {
      // neither fits fully -> prefer side with more space and clamp
      if (space.bottom >= space.top) {
        top = triggerRect.bottom + 6;
        const maxTop = viewportH - ddHeight - 8;
        top = Math.min(top, maxTop);
      } else {
        top = Math.max(8, triggerRect.top - ddHeight - 6);
      }
    }

    // Horizontal center align around trigger, then clamp
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    let left = Math.round(triggerCenterX - ddWidth / 2);
    const minLeft = 8;
    const maxLeft = Math.max(8, viewportW - ddWidth - 8);
    left = Math.min(Math.max(left, minLeft), maxLeft);

    // Convert to document coords so absolute positioning in body works with scroll
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    setDropdownPosition({
      top: Math.round(top + scrollY),
      left: Math.round(left + scrollX),
      width: ddWidth,
    });
  }, []);
  // -----------------------------------------------------------------------

  // Called from the trigger button
  const onTriggerClick = (e: React.MouseEvent, rowIndex: number) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLButtonElement;
    triggerRefs.current[rowIndex] = target;
    const willOpen = openDropdown === rowIndex ? null : rowIndex;
    setOpenDropdown(willOpen);
    if (willOpen !== null) {
      // compute immediately (dropdown might not be measured yet — ResizeObserver will refine)
      computeAndSetPosition(target);
    } else {
      setDropdownPosition(null);
    }
  };

  // Recalculate when open, on scroll/resize or when dropdown size changes
  useLayoutEffect(() => {
    if (openDropdown === null) return;
    const handleChange = () => {
      const trigger = triggerRefs.current[openDropdown] ?? null;
      computeAndSetPosition(trigger);
    };
    window.addEventListener('resize', handleChange, { passive: true });
    window.addEventListener('scroll', handleChange, { passive: true });

    // Resize observer for dropdown content changes
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => handleChange());
      if (dropdownRef.current) ro.observe(dropdownRef.current);
    } catch (err) {
      // ignore if not supported
    }

    // run once
    handleChange();

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('scroll', handleChange);
      if (ro && dropdownRef.current) ro.unobserve(dropdownRef.current);
      ro = null;
    };
  }, [openDropdown, computeAndSetPosition]);

  // ----------------- JSX (unchanged structure) -----------------
  return (
    <>
      <div className="w-full min-h-[calc(100vh-250px)] flex flex-col justify-between">
        <div className="overflow-x-auto relative h-full scrollbar-custom">
          <table className="min-w-max text-xs text-primaryText">
            <thead className="bg-[#EDF3EF] sticky top-0 z-[10]">
              <tr>
                {columns.map((col) => (
                  <th key={col.key}
                    className={`px-3 py-2 bg-[#EDF3EF] border-b border-gray-200 text-left
                    ${col.fixed === "left1" ? "sticky left-0 z-10" : ""} 
                    ${col.fixed === "left2" ? "sticky left-10 z-10" : ""} 
                    ${col.fixed === "left3" ? "sticky left-[116px] z-10" : ""} 
                    ${col.fixed === "right" ? "sticky right-0 bg-[#EDF3EF] z-10" : ""}`}
                    style={col.width ? { width: col.width, minWidth: col.width } : {}}
                  >
                    {col.key === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={areAllVisibleSelected}
                        style={{ accentColor: '#009728' }}
                        onChange={(e) => {
                          if (orders.length === 0) return
                          if (areAllVisibleSelected) {
                            const visibleGuids = orders.map((row: any) => row.order_guid).filter(Boolean)
                            const remaining = selectedGuids.filter((g) => !visibleGuids.includes(g))
                            updateSelection(remaining)
                          } else {
                            const visibleGuids = orders.map((row: any) => row.order_guid).filter(Boolean)
                            const next = Array.from(new Set([...selectedGuids, ...visibleGuids]))
                            updateSelection(next)
                          }
                        }}
                      />
                    ) : col.label}
                  </th>
                ))}
              </tr>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}
                    className={`px-3 py-2 bg-[#EDF3EF]
                    ${col.fixed === "left1" ? "sticky left-0 z-10" : ""} 
                    ${col.fixed === "left2" ? "sticky left-10 z-10" : ""} 
                    ${col.fixed === "left3" ? "sticky left-[116px] z-10" : ""} 
                    ${col.fixed === "right" ? "sticky right-0 bg-[#EDF3EF] z-10" : ""}`}
                    style={col.width ? { width: col.width, minWidth: col.width } : {}}
                  >
                    {["checkbox", "actions", "tat"].includes(col.key) ? null :
                      col.key === "date_of_birth" ? (
                        <DateOfBirthPicker
                          value={search[col.key]}
                          onChange={(date) => {
                            if (date) {
                              // Convert MM-DD-YYYY to YYYY-MM-DD for API
                              const parts = date.split('-');
                              if (parts.length === 3) {
                                const apiFormat = `${parts[0]}-${parts[1]}-${parts[2]}`;
                                updateFilter(col.key, apiFormat);
                              }
                            } else {
                              updateFilter(col.key, "");
                            }
                          }}
                          placeholder="MM-DD-YYYY"
                          className="rounded-full font-normal text-sm border-formBorder bg-white"
                        />
                      ) : col.key === 'created_at' ? (
                        <DateOfBirthPicker
                          value={search[col.key]}
                          onChange={(date) => {
                            if (date) {
                              // Convert MM-DD-YYYY to YYYY-MM-DD for API
                              const parts = date.split('-');
                              if (parts.length === 3) {
                                const apiFormat = `${parts[0]}-${parts[1]}-${parts[2]}`;
                                updateFilter(col.key, apiFormat);
                              }
                            } else {
                              updateFilter(col.key, "");
                            }
                          }}
                          placeholder="MM-DD-YYYY"
                          className="rounded-full font-normal text-sm border-formBorder bg-white"
                        />
                      ) : col.key === "date_of_service" ? (
                        <AllDatesPicker
                          value={search[col.key]}
                          onChange={(date) => {
                            if (date) {
                              // Convert MM-DD-YYYY to YYYY-MM-DD for API
                              const parts = date.split('-');
                              if (parts.length === 3) {
                                const apiFormat = `${parts[0]}-${parts[1]}-${parts[2]}`;
                                updateFilter(col.key, apiFormat);
                              }
                            } else {
                              updateFilter(col.key, "");
                            }
                          }}
                          placeholder="MM-DD-YYYY"
                          className="rounded-full font-normal text-sm border-formBorder bg-white"
                        />
                      ) : col.key === 'status' ? (
                        <div className="relative w-full">
                          <button
                            ref={statusButtonRef}
                            onClick={(e) => {
                              if (isRestrictedSection) return
                              const rect = statusButtonRef.current?.getBoundingClientRect()
                              if (rect) {
                                setStatusDropdownPosition({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.left + window.scrollX,
                                  width: rect.width
                                })
                              }
                              setStatusDropdownOpen(!statusDropdownOpen)
                            }}
                            className="rounded-full font-normal px-2 py-1 w-full text-sm focus:outline-none appearance-none pr-6 bg-white border-0 text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {search.status.length === 0
                                ? 'Select'
                                : search.status.length === 1
                                  ? search.status[0]
                                  : `${search.status[0]} +${search.status.length - 1}`}
                            </span>
                            {search.status.length > 0 && !isRestrictedSection ? (
                              <X
                                className="w-3 h-3 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateFilter('status', [])
                                }}
                              />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {statusDropdownOpen && statusDropdownPosition && !isRestrictedSection && ReactDOM.createPortal(
                            <div
                              ref={statusDropdownRef}
                              style={{
                                position: 'absolute',
                                top: statusDropdownPosition.top,
                                left: statusDropdownPosition.left,
                                width: statusDropdownPosition.width,
                              }}
                              className="z-[99999] bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto scrollbar-custom"
                            >
                              {STATUS_OPTIONS_ALL_ORDERS.map((status) => {
                                const isSelected = search.status.includes(status)
                                return (
                                  <div
                                    key={status}
                                    onClick={() => {
                                      const newStatuses = isSelected
                                        ? search.status.filter((s: string) => s !== status)
                                        : [...search.status, status]
                                      updateFilter('status', newStatuses)
                                    }}
                                    className={`px-3 py-2 text-sm flex items-center gap-2 hover:bg-green-50 cursor-pointer`}
                                  >
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span>{status}</span>
                                  </div>
                                )
                              })}
                            </div>,
                            document.body
                          )}
                        </div>
                      ) : getSelectOptions(col.key).length ? (
                        <div className="relative">
                          <StatusDropdown
                            value={search[col.key]}
                            onChange={(val) => updateFilter(col.key, val)}
                            options={getSelectOptions(col.key)}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={search[col.key]}
                            onChange={e => updateFilter(col.key, e.target.value)}
                            className="rounded-full font-normal px-2 py-1 w-full text-sm focus:outline-none pr-6"
                            placeholder="Search"
                          />
                          {search[col.key] && (
                            <button
                              onClick={() => updateFilter(col.key, "")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-text80 font-bold text-base"
                  >
                    <div className="w-full h-[200px] flex items-center justify-center text-center pt-10">
                      No Orders found
                    </div>
                  </td>
                </tr>
              )}
              {orders.map((row, i) => (
                <tr key={i} className="even:bg-gray-50 hover:bg-green-50 transition">
                  <td className="sticky left-0 bg-white z-[9] px-2 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row.order_guid)}
                      style={{ accentColor: '#009728' }}
                      onChange={(e) => {
                        const guid = row.order_guid as string | undefined
                        if (!guid) return
                        if (e.target.checked) {
                          if (!selectedGuids.includes(guid)) {
                            updateSelection([...selectedGuids, guid])
                          }
                        } else {
                          updateSelection(selectedGuids.filter((g) => g !== guid))
                        }
                      }}
                    />
                  </td>
                  <td className="sticky left-[40px] bg-white z-[9] px-2 border-b border-gray-200">
                    <button
                      ref={(el: HTMLButtonElement | null) => { triggerRefs.current[i] = el }}
                      className="text-gray-600 hover:text-green-600"
                      onClick={(e) => onTriggerClick(e, i)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.3751 12.3752V11.6252M11.6251 12.3752V11.6252M12.3751 19.3752V18.6252M11.6251 19.3752V18.6252M12.3751 5.37524V4.62524M11.6251 5.37524V4.62524M12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11ZM12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18ZM12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4Z" stroke="#009728" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>

                    {openDropdown === i && dropdownPosition && ReactDOM.createPortal(
                      <div
                        ref={dropdownRef}
                        style={{
                          position: "absolute",
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          minWidth: 200,
                          maxWidth: 360,
                          maxHeight: 360,
                          overflow: "auto",
                        }}
                        className="z-[99999] bg-white border border-gray-100 rounded-xl shadow-xl py-2"
                      >
                        {ACTIONS.map(({ label, icon: Icon, link }, index) => {
                          const isReassign = label === 'Reassign Order'
                          const disabled = isReassign && ['PENDING', 'PERFORMED', 'COMPLETED', 'CANCELLED', 'DELIVERED TO LAB'].includes(row?.status) && row?.order_type !== 'RETURN VISIT';
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (disabled) return
                                setOpenDropdown(null)
                                if (label === 'Reassign Order') {
                                  setSelectedOrderGuid(row.order_guid || null);
                                  setSelectedOrder({ id: row.phlebio_order_id, date: row.date_of_service || "", orderGuid: row.order_guid, type: label })
                                  setShowReassignModal(true)
                                } else if (label === 'Admin Notes') {
                                  setSelectedOrder({ id: row.phlebio_order_id, date: row.date_of_service || "", orderGuid: row.order_guid, type: label });
                                  setShowProgressModal(true)
                                } else if (label === 'Technician Notes') {
                                  setSelectedOrder({ id: row.phlebio_order_id, date: row.date_of_service || "", orderGuid: row.order_guid, type: label });
                                  setShowProgressModal(true)
                                } else if (label === 'Cancel') {
                                  if (!row.order_guid) {
                                    return;
                                  }
                                  setSelectedOrder({ id: row.phlebio_order_id, date: row.date_of_service || "", orderGuid: row.order_guid });
                                  setShowCancelModal(true)
                                } else if (label === 'Edit Order') {
                                  if (!row.order_guid) {
                                    return;
                                  }
                                  router.push(`/orders/createNeworder?orderGuid=${encodeURIComponent(row.order_guid)}`)
                                } else if (label === 'Reorder') {
                                  if (!row.order_guid) {
                                    return;
                                  }
                                  router.push(`/orders/createNeworder?orderGuid=${encodeURIComponent(row.order_guid)}&mode=reorder`)
                                } else if (label === 'Print Requisition') {
                                  if (!row.order_guid) {
                                    return;
                                  }
                                  handlePrintRequisition(row.order_guid)
                                } else if (link) {
                                  router.push(`/orders/view?orderGuid=${row.order_guid}`)
                                }
                              }}
                              disabled={disabled || (label === 'Print Requisition' && printingRequisition === row.order_guid)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-all ${disabled || (label === 'Print Requisition' && printingRequisition === row.order_guid) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}
                            >
                              <Icon className={`w-4 h-4 ${(disabled || (label === 'Print Requisition' && printingRequisition === row.order_guid)) ? 'opacity-40' : ''}`} />
                              {label === 'Print Requisition' && printingRequisition === row.order_guid ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                                  Printing...
                                </>
                              ) : (
                                label
                              )}
                            </button>
                          )
                        })}
                      </div>, document.body
                    )}
                  </td>
                  <td className="sticky left-[116px] bg-white z-[9] px-2 border-b border-gray-200 ">{row?.phlebio_order_id ?? ''}</td>
                  <td
                    className="patient px-2 py-2 border-b border-gray-200 whitespace-normal break-words max-w-[160px] leading-tight"
                    style={{ width: "200px", minWidth: "200px" }}
                  >
                    {`${row?.patient?.first_name ?? ''} ${row?.patient?.middle_name ?? ''} ${row?.patient?.last_name ?? ''}`.trim()}
                  </td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.patient?.date_of_birth ? formatUTCDateOnly(row.patient.date_of_birth) : ""}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.emr_order_id ? row?.emr_order_id : row?.lab_order_id}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.order_type ?? ''}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.urgency ?? ''}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.fasting ? "YES" : "NO"}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.tat ?? ''}</td>
                  <td className="px-2 py-2 border-b border-gray-200">
                    <Tooltip
                      text={(row?.test_info ?? [])
                        .map((t: any) => t?.test_code)
                        .filter(Boolean)
                        .join(", ")}
                    >
                      <span className="test-code block max-w-[140px] truncate cursor-help text-gray-800">
                        {(row?.test_info ?? [])
                          .map((t: any) => t?.test_code)
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="partner-name px-2 py-2 border-b border-gray-200">{row?.partner?.name ?? ''}</td>
                  <td className="physician px-2 py-2 border-b border-gray-200">{`${row?.physician?.first_name ?? ''} ${row?.physician?.last_name ?? ''}`.trim()}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.created_at ? formatUTCDateOnly(row.created_at) : ""}</td>
                  <td className="px-2 py-2 border-b border-gray-200">{row?.date_of_service ? formatUTCDateOnly(row.date_of_service) : ""}</td>
                  <td className="serviceaddress px-2 py-2 border-b border-gray-200">{row?.service_address ?? row?.service_address ?? ''}</td>
                  <td className="technician px-2 py-2 border-b border-gray-200">{`${row?.technician_data?.first_name ?? ''} ${row?.technician_data?.last_name ?? ''}`.trim()}</td>
                  <td className="admin-notes px-2 py-2 border-b border-gray-200">{row?.adminNotes ?? row?.admin_notes ?? ''}</td>
                  <td className="technician-notes px-2 py-2 border-b border-gray-200">{row?.technicianNotes ?? row?.technician_notes ?? ''}</td>
                  <td className="sticky right-0 bg-white z-[9] px-2 border-b border-gray-200">
                    <span className={`text-xs ${row.status === "PENDING" ? "text-yellow-500"
                      : row.status === "REJECTED" ? "text-red-500"
                        : row.status === "ASSIGNED" ? "text-blue-500"
                          : row.status === "COMPLETED" ? "text-green-600"
                            : "text-gray-500"
                      }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Items per page:</span>
              <select
                className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); }}
              >
                {[10, 25, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            {(() => {
              const perPage = Number(limit || pageSize) || 10
              const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1
              const endIdx = Math.min(page * perPage, total)
              return (<span className="text-xs text-gray-600">{startIdx}-{endIdx} of {total}</span>)
            })()}
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
            {makePages().map((p, idx) => typeof p === 'number' ? (
              <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
            ) : <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>)}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
            <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {
        showReassignModal && selectedOrderGuid && (
          <ReAssignTechnicianModal
            isOpen={showReassignModal}
            onClose={() => {
              setShowReassignModal(false);
              setSelectedOrderGuid(null);
            }}
            selectedOrderGuids={[selectedOrderGuid]}
            onSuccess={() => {
              handleSuccess("Order re-assigned successfully");
              setShowReassignModal(false);
              setSelectedOrderGuid(null);
              setRefreshTrigger(prev => prev + 1);
            }}
            onError={(msg) => handleError(msg)}
            order_id={selectedOrder ? selectedOrder.id : undefined}
          />
        )
      }
      {showProgressModal && <NotesModal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} order_guid={selectedOrder.orderGuid} type={selectedOrder.type} onRefresh={onRefresh} onSuccess={handleSuccess} onError={handleError} />}
      <ScheduleNotesModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} />
      {
        showCancelModal && selectedOrder && (
          <CancelOrderModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} orderGuid={selectedOrder.orderGuid} onRefresh={onRefresh} onCancelSuccess={() => handleSuccess('Order cancelled successfully')} onError={handleError} />
        )
      }
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}

export default DataTable;
