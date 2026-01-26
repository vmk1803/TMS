interface ActivityLog {
  title: string
  date: string
  subtitle?: string
  color?: string
}

interface ActivityLogsStepperProps {
  logs: ActivityLog[]
}

const fallbackColors = [
  'text-secondary',
  'text-blue-600',
  'text-green-600',
  'text-purple-600',
  'text-orange-600',
]

export default function ActivityLogsStepper({ logs }: ActivityLogsStepperProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"
        style={{
          top: 12,
          bottom: 12,
        }}
      />

      <div className="space-y-6">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-secondary"></div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-1">
              <p
                className={`text-base font-semibold ${
                  log.color ?? fallbackColors[idx % fallbackColors.length]
                }`}
              >
                {log.title}
              </p>
              <p className="text-sm text-gray-500">{log.date}</p>
              {log.subtitle && (
                <p className="text-sm text-gray-400 mt-1">{log.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
