import React from 'react'
interface ButtonLightProps {
  label: string
  Icon?: React.ElementType
  onClick?: () => void
  disabled?: boolean
  count?: number
}

const ButtonLight: React.FC<ButtonLightProps> = ({ label, Icon, onClick, disabled, count }) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex px-5 leading-none bg-white border border-[#ACB5BD]  h-10 rounded-full text-base text-text70 font-medium items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
      {typeof count === 'number' && count > 0 && (
        <span className="ml-1 bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}

export default ButtonLight