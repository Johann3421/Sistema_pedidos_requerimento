export default function SkeletonLoader({ count = 4, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-card shadow-card p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                <div className="h-6 bg-gray-100 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-card shadow-card overflow-hidden animate-pulse">
        <div className="p-4 space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded flex-1" />
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
