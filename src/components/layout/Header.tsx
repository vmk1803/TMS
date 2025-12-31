'use client'

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, LogOut, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import { MenuIcon } from "../Icons";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const searchParams = useSearchParams();
  const paramGuid = searchParams.get('user');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guid, setGuid] = useState<string | null>(paramGuid);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [storedUser, setStoredUser] = useState<any | null>(null);
  const { toggleSidebar, isMobile } = useSidebar();

  const notifications = [
    {
      icon: '/images/notification/neworder.svg',
      title: "New Order Received",
      desc: "Order #ORD-004 for Ms. Sunita Joshi is received successfully.",
      time: "12 mins ago",
      showView: true,
    },
    {
      icon: '/images/notification/priceNegotiation.svg',
      title: "Price Negotiation Approved",
      desc: "Your 15% rate for MedMatch Tests has been approved.",
      time: "12 mins ago",
      showView: false,
    },
    {
      icon: '/images/notification/report.svg',
      title: "Reports is Ready",
      desc: "Lab report for Patient ID: ORD-001 is now available",
      time: "Yesterday",
      showView: true,
    },
    {
      icon: '/images/notification/neworder.svg',
      title: "New Order Received",
      desc: "Order #ORD-004 for Ms. Sunita Joshi is received successfully.",
      time: "12 mins ago",
      showView: true,
    },
    {
      icon: '/images/notification/priceNegotiation.svg',
      title: "Price Negotiation Approved",
      desc: "Your 15% rate for MedMatch Tests has been approved.",
      time: "12 mins ago",
      showView: false,
    },
    {
      icon: '/images/notification/report.svg',
      title: "Reports is Ready",
      desc: "Lab report for Patient ID: ORD-001 is now available",
      time: "Yesterday",
      showView: true,
    },
  ];
  const [userGuid, setUserGuid] = useState<string | null>(null)
  useEffect(() => {
    console.log("Header mounted, checking localStorage for user GUID");
    const candidates = ["user", "loggedInUser", "labAdmin", "technician"]
    for (const key of candidates) {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const guid = parsed?.guid || parsed?.user_guid || parsed?.id || parsed?.user_id
      if (guid) { setUserGuid(guid); break }
    }
  }, [])

  const options = ["Profile", "Logout"];

  const handleLogout = () => {
    const keys = [
      'token',
      'accessToken',
      'refreshToken',
      'user',
      'loggedInUser',
      'labAdmin',
      'technician'
    ];
    keys.forEach(k => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(k);
      }
    });
    setUserGuid(null);
    setShowProfileMenu(false);
    setIsOpen(false);

    router.push('/');
  };

  useEffect(() => {
    console.log("Loading user data from localStorage");
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const candidate = parsed.user || parsed.data || parsed;
      setStoredUser(candidate);
      const fallbackGuid = candidate?.guid || candidate?.user_guid || candidate?.id || candidate?.user_id;
      if (fallbackGuid) setGuid(fallbackGuid); else setError('User GUID not found');
    } catch {
      setError('Corrupted user data');
    }
  }, []);

  useEffect(() => {
    console.log("Setting up user-updated event listener");
    function handleUserUpdated(e: any) {
      const detail = e?.detail;
      if (detail && typeof detail === 'object') {
        setStoredUser(detail);
        const fallbackGuid = detail?.guid || detail?.user_guid || detail?.id || detail?.user_id;
        setGuid(fallbackGuid || null);
      }
    }
    window.addEventListener('user-updated', handleUserUpdated);
    return () => window.removeEventListener('user-updated', handleUserUpdated);
  }, []);

  useEffect(() => {
    console.log("Setting up storage event listener for user changes");
    function handleStorage(e: StorageEvent) {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            const candidate = parsed.user || parsed.data || parsed;
            setStoredUser(candidate);
            const fallbackGuid = candidate?.guid || candidate?.user_guid || candidate?.id || candidate?.user_id;
            setGuid(fallbackGuid || null);
          } catch { setStoredUser(null); setGuid(null); }
        } else {
          setStoredUser(null);
          setGuid(null);
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  return (
    <>
      <header className="bg-primary border-b border-muted/20 !fixed mlx_Menu top-0 left-0 w-full z-[9999]">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            <div className='w-[190px] md:w-[170px]'>
              <div className="flex items-center space-x-2">
                <Image src={'/images/tms_logo.svg'} width={120} height={26} className="w-[120px] h-auto" alt='admin-mobilelabxpress' />
              </div>
            </div>
            <div className='cursor-pointer' onClick={toggleSidebar}>
              <MenuIcon />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {/* <div className="hidden md:flex items-center bg-secondary rounded-lg px-3 py-2">
              <Search size={16} className="text-muted mr-2" />
              <input
                type="text"
                placeholder="Search patients, orders..."
                className="bg-transparent text-sm placeholder-muted outline-none"
              />
            </div> */}

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 bg-[#EBEBEB] rounded-full text-secondary hover:text-primary transition-colors"
                onClick={() => setShowNotifications(s => !s)}
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-[380px] max-w-[95vw] rounded-xl shadow-xl z-50 bg-white border border-gray-200"
                    style={{ minHeight: 360, maxHeight: 480 }}
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b flex items-center justify-between z-10">
                      <div className="flex items-center">
                        <span className="font-semibold text-sm text-black">Notifications</span>
                        <span className="ml-2 px-2 bg-green-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                          2
                        </span>
                      </div>
                      <button className="text-[#7B6C9D] text-[10px] font-medium hover:underline">
                        Mark all as read
                      </button>
                    </div>
                    {/* Scrollable body */}
                    <div className="overflow-y-auto px-3 py-2" style={{ maxHeight: 330 }}>
                      {notifications.map((n, idx) => (
                        <div
                          key={idx}
                          className="border-b last:border-0 py-3 flex gap-3 items-start relative bg-white"
                        >

                          <Image src={n.icon} alt="" width={24} height={24} className="rounded-full border-2 border-green-600 p-1 h-6 w-6 flex items-center justify-center mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-xs text-black">{n.title}</div>
                            <div className="text-[10px] text-text60">{n.desc}</div>
                            <div className="text-[10px] text-text80 mt-2 flex gap-3 items-center justify-between">
                              <span>{n.time}</span>
                              {n.showView && (
                                <button className="px-4 py-1 bg-green-500 text-[10px] text-white rounded-md ml-1">
                                  View
                                </button>
                              )}
                            </div>
                          </div>
                          <button className="absolute top-0 right-3 text-gray-400 hover:text-red-400 text-lg">×</button>
                        </div>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white px-5 pt-2 pb-4 border-t flex items-center justify-center z-10">
                      {/* Example footer space or action */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}

            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setIsOpen(!isOpen);
                }}
                className="flex items-center space-x-3 cursor-pointer select-none"
              >
                {(() => {
                  const profilePic = storedUser?.profile_pic as string | undefined;
                  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL || '';
                  const resolvedPic = profilePic ? (profilePic.startsWith('http') ? profilePic : `${base}${profilePic}`) : null;
                  const first = storedUser?.fame || storedUser?.name?.split(' ')?.[0] || storedUser?.user_name || '';
                  const last = storedUser?.lname || storedUser?.name?.split(' ')?.slice(-1)[0] || '';
                  const fullName = ((storedUser?.fname || '') + ' ' + (storedUser?.lname || '')).trim() || storedUser?.user_name || 'User';
                  const role = storedUser?.role || '';
                  const initials = (first?.[0] || '') + (last?.[0] || '');
                  return (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-secondary">
                        {resolvedPic ? (
                          <img src={resolvedPic} alt="avatar" className="w-10 h-10 object-cover" />
                        ) : (
                          <span className="text-white text-sm font-medium w-10 h-10 flex items-center justify-center">
                            {initials || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-base text-white font-medium">{fullName
                          .split(" ")
                          .filter(Boolean)
                          .map(word => word[0].toUpperCase() + word.slice(1))
                          .join(" ")}</p>
                        <p className="text-base text-white font-medium">{role || 'User'}</p>
                      </div>
                    </>
                  );
                })()}

                <ChevronDown size={16} className="text-white" />
              </div>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {(showProfileMenu && isOpen) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 bg-white border border-muted/20 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2 flex flex-col space-y-1.5">
                      {/* {options.map((option) => (
                          <button
                            key={option}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-primaryText hover:bg-secondary hover:text-muted rounded-md transition-colors"
                            
                            type="button"
                          >
                            {option === "Logout" && <LogOut size={16} />}
                            <span>{option}</span>
                          </button>
                        ))} */}
                      {options.map((option) => (
                        <button
                          key={option}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-primaryText hover:bg-secondary hover:text-muted rounded-md transition-colors"
                          type="button"
                          onClick={() => {
                            if (option === "Profile") {
                              if (userGuid) {
                                router.push(`/profile?user=${encodeURIComponent(userGuid)}`)
                              } else {
                                router.push('/profile')
                              }
                            }
                            if (option === "Logout") {
                              handleLogout();
                            }
                            setShowProfileMenu(false)
                            setIsOpen(false)
                          }}
                        >
                          {option === "Logout" && <LogOut size={16} />}
                          <span>{option}</span>
                        </button>
                      ))}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </header>

      {/* {showLogin && <LoginPage onClose={() => setShowLogin(false)} />} */}
    </>
  );
}
