"use client";

import { usePathname } from 'next/navigation'
import ClientLayoutWrapper from './ClientLayoutWrapper'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if it's any authentication page (login, forgot-password, otp-verification, etc.)
  const isAuthPage = pathname === "/" || pathname?.startsWith("/login");

  // If it's an auth page, no header/sidebar
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <ClientLayoutWrapper>
      <div className="p-4">{children}</div>
    </ClientLayoutWrapper>
  );
}
