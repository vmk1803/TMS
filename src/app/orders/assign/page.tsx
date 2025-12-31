"use client";

import React from 'react'
import dynamic from 'next/dynamic'

const AssignMap = dynamic(() => import('./components/AssignMap'), { ssr: false })

const AssignMapPage: React.FC = () => {
  return <AssignMap />
}

export default AssignMapPage