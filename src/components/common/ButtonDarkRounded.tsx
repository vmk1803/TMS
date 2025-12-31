'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface ButtonDarkRoundedProps {
  label: string
  Icon?: React.ElementType
  link?: string
}

const ButtonDarkRounded: React.FC<ButtonDarkRoundedProps> = ({ label, Icon, link }) => {
  const router = useRouter()

  const handleClick = () => {
    if (link) {
      router.push(link)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex px-5 bg-secondary rounded-full text-base h-10 text-white font-medium items-center cursor-pointer gap-2 hover:bg-secondary/90 transition-all"
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </button>
  )
}

export default ButtonDarkRounded
