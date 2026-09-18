import { Skeleton } from "@/components/ui/skeleton";

// Shared loading placeholders for the admin screens.
//
// Every admin page used to return a single centered spinner while its query
// was in flight, which meant the page header, action buttons and table chrome
// — all of which are static and need no data — waited on the network too. The
// result read as "the panel is lagging" even when the request itself was fine.
// These skeletons let each page paint its real layout immediately and fill in
// only the data-dependent regions.

/** One shimmering table row, sized to the column count. */
export function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-slate-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full bg-slate-800" />
        </td>
      ))}
    </tr>
  );
}

/** Placeholder body for a table that is still loading. */
export function SkeletonTableBody({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </tbody>
  );
}

/** Light-surface table placeholder, for the white admin cards. */
export function SkeletonTableBodyLight({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Placeholder for the dashboard's metric cards. */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder for a chart panel. */
export function SkeletonChartCard({ title }: { title: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="w-full h-64 mt-6 flex items-end gap-3">
        {[45, 70, 55, 85, 60, 95].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Generic card-grid placeholder (courses, resources, categories). */
export function SkeletonCardGrid({
  count = 6,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="pt-2 flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
