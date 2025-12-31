'use client'
import React from 'react'

interface TabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ['Information', 'Attachments', 'Notes']

  return (
    <div className="flex flex-wrap gap-6 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-2 text-[16px] font-medium transition-all ${
            activeTab === tab
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default Tabs
