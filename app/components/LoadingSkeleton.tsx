interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'map' | 'detail';
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ type = 'card', count = 6, className = "" }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="rounded-3xl overflow-hidden shadow-xl bg-glass">
      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2 mt-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-6 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMapSkeleton = () => (
    <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading peta...</div>
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="rounded-3xl overflow-hidden shadow-xl bg-glass">
      <div className="w-full h-60 sm:h-80 bg-gray-200 animate-pulse"></div>
      <div className="p-4 border-b border-[#213DFF11] flex justify-end">
        <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="p-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="mb-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'list':
      return renderListSkeleton();
    case 'map':
      return renderMapSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    case 'card':
    default:
      return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
          {[...Array(count)].map((_, i) => (
            <div key={i}>{renderCardSkeleton()}</div>
          ))}
        </div>
      );
  }
} 