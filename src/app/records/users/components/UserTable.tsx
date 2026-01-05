"use client";
import ReactDOM from "react-dom";
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { Pencil, Eye, MoreVertical, X } from "lucide-react";
import StatusDropdown from "../../../../components/common/StatusDropdown";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from "../../../../utils/filterPersistence";
import { getAllUsers, resetUserPassword, toggleUserStatus } from "../services/viewUserService";
import Toast from "../../../../components/common/Toast";
import moment from "moment";
import { User, Repeat, ToggleLeft, Trash2 } from "lucide-react";
import { hasFullAccess } from "../../../../utils/rbac";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "Active", value: "false" },
  { label: "Inactive", value: "true" },
];
const ROLE_OPTIONS = [
  { label: "Lab Admin", value: "LAB ADMIN" },
  { label: "Technician", value: "TECHNICIAN" },
  // { label: "Technician Lead", value: "TECHNICIAN LEAD" },
  { label: "Lab Super Admin", value: "LAB SUPER ADMIN" }
]

const columns = [
  { key: "checkbox", label: "", width: "40px" },
  { key: "full_name", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Mobile Number" },
  { key: "user_type", label: "Role" },
  // { key: "user_name", label: "User Name" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "is_deleted", label: "Status", width: "160px" },
  { key: "actions", label: "Actions", width: "120px" },
];

export interface UserTableRef {
  exportSelected: () => Promise<void>;
}

interface UserTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const UserTable = forwardRef<UserTableRef, UserTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = useState<Record<string, string>>(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['full_name', 'email', 'phone_number', 'user_type', 'date_of_birth', 'is_deleted']);
    return {
      full_name: urlFilters.full_name || "",
      email: urlFilters.email || "",
      phone_number: urlFilters.phone_number || "",
      user_type: urlFilters.user_type || "",
      date_of_birth: urlFilters.date_of_birth || "",
      is_deleted: urlFilters.is_deleted || "",
    };
  });

  // Update URL when search filters change
  const DEBOUNCE_MS = 300;
  useEffect(() => {
    const id = setTimeout(() => {
      updateUrlWithFilters(router, pathname, search, page, pageSize);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search, router, pathname, page, pageSize]);

  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());

  // Selection state
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Selection handlers
  const updateSelection = (next: string[]) => {
    setSelectedGuids(next);
    if (onSelectionChange) {
      onSelectionChange(next);
    }
  };

  const isRowSelected = (guid?: string) => {
    if (!guid) return false;
    return selectedGuids.includes(guid);
  };

  const areAllVisibleSelected = users.length > 0 && users.every((row: any) => row.guid && selectedGuids.includes(row.guid));

  // Clear selection when clearSelectionKey changes
  useEffect(() => {
    if (typeof clearSelectionKey !== 'undefined') {
      updateSelection([]);
    }
  }, [clearSelectionKey]);



  // Filter user actions based on permissions
  const USER_ACTIONS = useMemo(() => {
    const fullAccess = hasFullAccess();

    if (fullAccess) {
      // LAB SUPER ADMIN sees all actions
      return [
        { label: "Reset Password", icon: Repeat },
        { label: "Toggle Active", icon: ToggleLeft }
      ];
    } else {
      // LAB ADMIN and TECHNICIAN see no dropdown actions
      return [];
    }
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawFilters = useMemo(() => {
    const f: Record<string, any> = {};
    Object.entries(search).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'is_deleted') {
        f[k] = v === 'true';
        return;
      }
      f[k] = v.trim();
    });
    return f;
  }, [search]);

  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, any>>({});
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedFilters(rawFilters);
      // Don't reset page - let the URL handle pagination state
    }, 300);
    return () => clearTimeout(id);
  }, [rawFilters]);

  const fetchUsers = async () => {
    try {
      const result = await getAllUsers({
        page,
        pageSize,
        filters: Object.keys(debouncedFilters).length ? debouncedFilters : undefined,
      });
      setUsers(result?.data || []);
      setTotalUsers(result?.total_count || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, debouncedFilters]);

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        // Fetch all users data (not paginated) to ensure we get all selected users
        const result = await getAllUsers({
          page: 1,
          pageSize: 10000, // Large number to get all users
          filters: Object.keys(debouncedFilters).length ? debouncedFilters : undefined,
        });
        const allUsers = result?.data || [];
        // Filter by selected GUIDs
        const selectedUsers = allUsers.filter((user: any) => externalSelectedGuids?.includes(user.guid));
        
        // Map to only include visible table columns
        const exportData = selectedUsers.map((user: any) => ({
          "Full Name": `${user.first_name ?? ""} ${user.middle_name ?? ""} ${user.last_name ?? ""}`.trim(),
          "Email": user.email ?? "--",
          "Mobile Number": user.phone_number ?? "--",
          "Role": user.user_type ?? "--",
          "Date of Birth": user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US').replace(/\//g, '-') : "--",
          "Status": user.is_deleted ? "Inactive" : "Active"
        }));
        
        exportToCSV(exportData, 'users');
        if (onExportComplete) {
          onExportComplete(selectedUsers.length);
        }
      } catch (err) {
        console.error('Failed to export users:', err);
      }
    }
  }), [debouncedFilters, externalSelectedGuids, onExportComplete]);

  const totalPages = Math.ceil(totalUsers / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">

      {/* TABLE */}
      <div className="overflow-x-auto h-[calc(100vh-240px)] scrollbar-custom">
        <table className="min-w-max w-full text-sm text-[#344256]">

          {/* HEADER */}
          <thead className="bg-[#EDF3EF] sticky top-0 z-20 shadow-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : {}}
                  className={`px-4 py-2 text-left font-semibold whitespace-nowrap text-gray-900
                    ${col.key === 'checkbox' ? 'sticky left-0 z-[19] bg-[#EDF3EF]' : ''}
                    ${col.key === 'full_name' ? 'sticky left-[40px] z-20 bg-[#EDF3EF]' : ''}
                    ${col.key === 'is_deleted' ? 'sticky right-[120px] z-20 bg-[#EDF3EF]' : ''}
                    ${col.key === 'actions' ? 'sticky right-0 z-[19] bg-[#EDF3EF]' : ''}`}
                >
                  {col.key === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={areAllVisibleSelected}
                      style={{ accentColor: '#009728' }}
                      onChange={(e) => {
                        if (users.length === 0) return;
                        if (areAllVisibleSelected) {
                          const visibleGuids = users.map((row: any) => row.guid).filter(Boolean);
                          const remaining = selectedGuids.filter((g) => !visibleGuids.includes(g));
                          updateSelection(remaining);
                        } else {
                          const visibleGuids = users.map((row: any) => row.guid).filter(Boolean);
                          const next = Array.from(new Set([...selectedGuids, ...visibleGuids]));
                          updateSelection(next);
                        }
                      }}
                    />
                  ) : col.label}
                </th>
              ))}
            </tr>

            {/* FILTER ROW */}
            <tr className="bg-[#EDF3EF] ">
              {columns.map((col) => {
                const baseClasses = `px-4 py-2 ${col.key === "checkbox" ? "sticky left-0 z-[19] bg-[#EDF3EF]" : ""} ${col.key === "full_name" ? "sticky left-[40px] z-20 bg-[#EDF3EF]" : ""} ${col.key === "is_deleted" ? "sticky right-[120px] z-20 bg-[#EDF3EF]" : ""} ${col.key === "actions" ? "sticky right-0 z-[19] bg-[#EDF3EF]" : ""}`;
                if (["checkbox", "actions"].includes(col.key)) {
                  return <th key={col.key} className={baseClasses}></th>;
                }
                
                if (col.key === "is_deleted") {
                  return (
                    <th key={col.key} className={baseClasses}>
                      <StatusDropdown
                        value={STATUS_OPTIONS.find(opt => opt.value === search.is_deleted)?.label || ''}
                        options={STATUS_OPTIONS.map(opt => opt.label)}
                        onChange={(value) => setSearch(s => ({ ...s, is_deleted: value ? STATUS_OPTIONS.find(opt => opt.label === value)?.value || '' : '' }))}
                        placeholder="Select"
                      />
                    </th>
                  );
                }
                
                if (col.key === "user_type") {
                  return (
                    <th key={col.key} className={baseClasses}>
                      <StatusDropdown
                        value={ROLE_OPTIONS.find(opt => opt.value === search.user_type)?.label || ''}
                        options={ROLE_OPTIONS.map(opt => opt.label)}
                        onChange={(value) => setSearch(s => ({ ...s, user_type: value ? ROLE_OPTIONS.find(opt => opt.label === value)?.value || '' : '' }))}
                        placeholder="Role"
                      />
                    </th>
                  );
                }
                return (
                  <th key={col.key} className={baseClasses}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-full px-3 py-1.5 rounded-full bg-white border border-gray-300 text-xs focus:ring-green-300 focus:border-green-500 outline-none pr-8"
                        value={search[col.key] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearch(s => ({ ...s, [col.key]: val }));
                        }}
                      />
                      {search[col.key] && (
                        <button
                          onClick={() => setSearch(s => ({ ...s, [col.key]: "" }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {/* NO DATA */}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={8} className="text-center py-6 text-gray-500"
                >
                  No Users Found
                </td>
              </tr>
            )}
            {users.map((row, i) => (
              <tr
                key={i}
                className={`${i % 2 === 0 ? "bg-white" : "bg-[gray-50]"
                  } border-b border-gray-100 hover:bg-green-50 transition`}
              >
                <td className="px-4 py-3 sticky left-0 bg-[#fff] z-[19]">
                  <input
                    type="checkbox"
                    checked={isRowSelected(row.guid)}
                    style={{ accentColor: '#009728' }}
                    onChange={(e) => {
                      const guid = row.guid;
                      if (!guid) return;
                      if (e.target.checked) {
                        if (!selectedGuids.includes(guid)) {
                          updateSelection([...selectedGuids, guid]);
                        }
                      } else {
                        updateSelection(selectedGuids.filter((g) => g !== guid));
                      }
                    }}
                  />
                </td>

                <td className="px-4 py-3 sticky left-[40px] bg-[#ffffff] z-[19] font-medium">
                  {row.first_name} {row.last_name}
                </td>

                <td className="px-4 py-3 z-[10]">{row.email}</td>
                <td className="px-4 py-3">{row.phone_number}</td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                    {row.user_type}
                  </span>
                </td>

                {/* <td className="px-4 py-3">{row.user_name}</td> */}

                <td className="px-4 py-3">
                  {row.date_of_birth
                    ? moment(row.date_of_birth).format("MM-DD-YYYY")
                    : "NA"}
                </td>

                {/* Status */}
                <td className="px-4 py-3 sticky right-[120px] bg-[#fff] z-[19]">
                  <span
                    className={`px-4 py-1 text-xs rounded-full border font-medium ${row.is_deleted
                      ? "bg-[#EDF3EF] text-gray-700"
                      : "bg-green-100 text-green-700 border-green-300"
                      }`}
                  >
                    {row.is_deleted ? "Inactive" : "Active"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 sticky right-0 bg-inherit z-[19]">
                  <div className="flex items-center gap-3 text-green-600">
                    {hasFullAccess() && (
                      <button
                        type="button"
                        disabled={!row.guid && !row.user_guid && !row.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const guid = row.guid || row.user_guid || row.id;
                          if (!guid) return;
                          router.push(`/records/users/edit/${encodeURIComponent(guid)}`);
                        }}
                        className="p-1 rounded hover:bg-green-100"
                        aria-label="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={!row.guid}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!row.guid) return;
                        router.push(`/records/users/view?user=${encodeURIComponent(row.guid)}`);
                      }}
                      className="p-1 rounded hover:bg-green-100"
                      aria-label="View user"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {hasFullAccess() && USER_ACTIONS.length > 0 && (
                      <MoreVertical
                        className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setOpenDropdown(openDropdown === i ? null : i);
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY + 6,
                            left: rect.left + window.scrollX - 160, // adjust for right-side position
                          });
                        }}
                      />
                    )}
                    {hasFullAccess() && openDropdown === i && dropdownPosition &&
                      ReactDOM.createPortal(
                        <div
                          ref={dropdownRef}
                          style={{
                            position: "absolute",
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                          }}
                          className="z-[99999] bg-white rounded-2xl shadow-xl w-48 p-2 border border-gray-100"
                        >
                          {USER_ACTIONS.map(({ label, icon: Icon }, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setOpenDropdown(null);

                                if (label === "Reset Password") {
                                  const guid = row.guid;
                                  if (!guid || inFlight.has(guid)) return;
                                  setUsers(prev => prev.map(u => u === row ? row : u));
                                  setInFlight(prev => new Set(prev).add(guid));
                                  resetUserPassword(guid)
                                    .then(() => {
                                      setToastType('success');
                                      setToastMessage(`User password has been reset successfully`);
                                      setToastOpen(true);
                                      fetchUsers();
                                    })
                                    .catch((e) => {
                                      setUsers(prev => prev.map(u => u === row ? row : u));
                                      setToastType('error');
                                      setToastMessage(e?.message || 'Failed to reset password');
                                      setToastOpen(true);
                                    })
                                    .finally(() => {
                                      setInFlight(prev => { const n = new Set(prev); n.delete(guid); return n; });
                                    });
                                }

                                if (label === "Toggle Active") {
                                  const guid = row.guid;
                                  if (!guid || inFlight.has(guid)) return;
                                  const previous = row.is_deleted;
                                  row.is_deleted = !previous;
                                  setUsers(prev => prev.map(u => u === row ? row : u));
                                  setInFlight(prev => new Set(prev).add(guid));
                                  toggleUserStatus(guid)
                                    .then(() => {
                                      setToastType('success');
                                      setToastMessage(`User status set to ${row.is_deleted ? 'Inactive' : 'Active'}`);
                                      setToastOpen(true);
                                      fetchUsers();
                                    })
                                    .catch((e) => {
                                      row.is_deleted = previous;
                                      setUsers(prev => prev.map(u => u === row ? row : u));
                                      setToastType('error');
                                      setToastMessage(e?.message || 'Failed to toggle status');
                                      setToastOpen(true);
                                    })
                                    .finally(() => {
                                      setInFlight(prev => { const n = new Set(prev); n.delete(guid); return n; });
                                    });
                                }
                              }}
                              className="w-full group flex items-center gap-3 px-3 py-2 text-sm text-primaryText rounded-lg hover:bg-lightGreen hover:text-secondary transition"
                            >
                              <Icon className="w-4 h-4 text-primaryText group-hover:text-secondary" />
                              {label === "Toggle Active"
                                ? (row.is_deleted ? "Activate User" : "InActivate User")
                                : label}
                            </button>
                          ))}
                        </div>,
                        document.body
                      )
                    }


                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Items per page:</span>
            <select
              className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
              value={pageSize}
              onChange={(e) => { 
                const newPageSize = Number(e.target.value);
                setPageSize(newPageSize); 
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-600">
            {users.length === 0
              ? '0-0'
              : `${startIndex + 1}-${startIndex + users.length}`} of {totalUsers}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
          {(() => {
            const tp = totalPages
            const pages: (number | string)[] = []
            const first = 1
            const last = tp
            const start = Math.max(first, page - 1)
            const end = Math.min(last, page + 1)
            pages.push(first)
            if (start > first + 1) pages.push('…')
            for (let p = start; p <= end; p++) {
              if (p !== first && p !== last) pages.push(p)
            }
            if (end < last - 1) pages.push('…')
            if (last > first) pages.push(last)
            return pages
          })().map((p, idx) => (
            typeof p === 'number' ? (
              <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
            ) : (
              <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>
            )
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
        </div>
      </div>
      <Toast open={toastOpen} type={toastType} message={toastMessage} onClose={() => setToastOpen(false)} />
    </div>
  );
});

UserTable.displayName = 'UserTable';

export default UserTable;
