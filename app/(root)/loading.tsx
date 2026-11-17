// Generic skeleton for (root) pages while their server data loads.
// The layout (session check + Header) stays visible above it.

const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg border border-gray-600 bg-gray-800 ${className}`} />
);

export default function Loading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-700" />
          <Block className="h-[500px]" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-700" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Block key={i} className="h-[130px]" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Block className="h-80" />
        <Block className="h-80" />
      </div>
    </div>
  );
}
