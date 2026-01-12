interface YearSelectorProps {
  value: number | undefined
  onChange: (year: number | undefined) => void
  disabled?: boolean
  className?: string
  includeAllYears?: boolean
  yearsBack?: number
}

export default function YearSelector({
  value,
  onChange,
  disabled = false,
  className = "",
  includeAllYears = true,
  yearsBack = 5
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  
  const yearOptions = [
    ...(includeAllYears ? [{ value: undefined, label: 'All Years' }] : []),
    ...Array.from({ length: yearsBack }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString()
    }))
  ]

  const baseClassName = "border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-w-[100px]"

  return (
    <select
      className={`${baseClassName} ${className}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
      disabled={disabled}
    >
      {yearOptions.map(option => (
        <option key={option.label} value={option.value || ''}>
          {option.label}
        </option>
      ))}
    </select>
  )
}