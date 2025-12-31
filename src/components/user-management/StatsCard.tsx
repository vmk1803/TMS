interface Props {
  title: string
  value: string
  change?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-flex">
      <div>
        <p className="text-sm text-text70">{title}</p>
        <h3 className="text-xl font-semibold mt-1">{value}</h3>

        {change && (
          <p className="text-xs text-green-600 mt-1">
            ↑ {change} from last month
          </p>
        )}
      </div>
      <div className="shrink-0">
        <Icon className="w-12 h-12" />
      </div>
    </div>
  )
}
