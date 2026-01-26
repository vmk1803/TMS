"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

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
            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
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

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
