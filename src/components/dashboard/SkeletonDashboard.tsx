import { KPICardSkeleton } from "./KPICard";

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-6 w-64 rounded" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-5 space-y-4">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-[260px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Forecast chart skeleton */}
      <div className="bg-card border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-52 rounded" />
          <div className="skeleton h-8 w-28 rounded-lg" />
        </div>
        <div className="skeleton h-[200px] w-full rounded-lg" />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-5 space-y-3">
            <div className="skeleton h-4 w-32 rounded" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between py-2 border-b">
                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-48 rounded" />
                  <div className="skeleton h-2.5 w-32 rounded" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
