// Loading skeleton shown while habits are being fetched from MongoDB.
// Matches the exact layout of HabitCard so there's no layout shift on load.
// Week 4, item 6.

export default function HabitCardSkeleton() {
  return (
    <div className="rounded-2xl border border-paperLine bg-white/70 p-5 flex flex-col gap-4 animate-pulse">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-lg bg-paperLine" />
          <div className="h-3 w-1/4 rounded-full bg-paperLine" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-7 w-7 rounded-lg bg-paperLine" />
          <div className="h-7 w-7 rounded-lg bg-paperLine" />
        </div>
      </div>

      {/* Badge row */}
      <div className="flex gap-1.5">
        <div className="h-6 w-12 rounded-full bg-paperLine" />
        <div className="h-6 w-12 rounded-full bg-paperLine" />
        <div className="h-6 w-12 rounded-full bg-paperLine" />
      </div>

      {/* 7-day calendar strip */}
      <div className="flex justify-between gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="h-2.5 w-2.5 rounded bg-paperLine" />
            <div className="h-6 w-6 rounded-full bg-paperLine" />
          </div>
        ))}
      </div>

      {/* Tick button */}
      <div className="h-10 w-full rounded-xl bg-paperLine" />
    </div>
  )
}
