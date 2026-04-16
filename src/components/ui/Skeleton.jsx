export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`panel-card card-accent rounded-[1.6rem] border border-border/70 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
        <SkeletonLine className="h-8 w-18 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
