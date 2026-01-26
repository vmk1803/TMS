// app/layout.tsx
"use client";

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Provider } from 'react-redux'
import store, { persistor } from '../store/store'
import { PersistGate } from 'redux-persist/integration/react'
import LayoutWrapper from '../components/layout/LayoutWrapper'
import { message } from 'antd'

// Configure Ant Design message globally to appear above the fixed header
message.config({
  top: 100,        // Position below the header (header is ~70px tall)
  maxCount: 3,     // Limit simultaneous messages
  duration: 3,     // Auto-close after 3 seconds
  prefixCls: 'ant-message',
})

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </PersistGate>
        </Provider>
      </body>
    </html>
  )
}
