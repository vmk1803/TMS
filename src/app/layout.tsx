// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import LayoutWrapper from '../components/layout/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TMS - Admin Dashboard',
  description: "Manage your lab's operations efficiently with Mobile Lab Xpress Admin Dashboard.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
