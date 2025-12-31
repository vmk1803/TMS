"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { Provider } from 'react-redux'
import store, { persistor } from '../../store/store'
import { PersistGate } from 'redux-persist/integration/react'
import ProtectedRoute from "../auth/ProtectedRoute";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();

  const HEADER_HEIGHT = 72;
  const COLLAPSED_SIDEBAR = 76;
  const EXPANDED_SIDEBAR = 240;

  return (
    <div className="min-h-screen bg-muted">
      {/* Fixed Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Scrollable Page Content */}
        <main
          className="flex-1 transition-all duration-300 overflow-y-auto"
          style={{
            marginLeft: window.innerWidth >= 1024
              ? (isExpanded ? EXPANDED_SIDEBAR : COLLAPSED_SIDEBAR)
              : 0,
            paddingTop: HEADER_HEIGHT,
            height: "100vh",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Check if it's any authentication page (login, forgot-password, otp-verification, etc.)
  const isAuthPage = pathname === "/" || pathname?.startsWith("/login");

  // If it's an auth page, no header/sidebar
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ProtectedRoute>
          <SidebarProvider>
            <LayoutContent><div className="p-4">{children}</div></LayoutContent>
          </SidebarProvider>
        </ProtectedRoute>
      </PersistGate>
    </Provider>
  );
}
