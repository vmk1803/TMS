export default function Loading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48"></div>

          {/* Calendar skeleton */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
