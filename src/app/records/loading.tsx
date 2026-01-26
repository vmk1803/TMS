export default function Loading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48"></div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
