export default function Loading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48"></div>

          {/* Profile skeleton */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
