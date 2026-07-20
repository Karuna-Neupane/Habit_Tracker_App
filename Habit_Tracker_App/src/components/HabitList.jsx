// HabitList — Week 4 update
// Shows loading skeletons while habits are being fetched from MongoDB.
// When loaded, shows the real HabitCards with live data from DB.

import HabitCard from './HabitCard.jsx'
import HabitCardSkeleton from './HabitCardSkeleton.jsx'

export default function HabitList({ habits, loading, error, onToggleToday, onEdit, onDelete }) {

  // Week 4, item 6: loading skeleton while habits fetch from MongoDB
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <HabitCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state — couldn't reach the backend / MongoDB
  if (error) {
    return (
      <div className="rounded-2xl border border-ember/30 bg-emberSoft/40 p-8 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="font-display font-semibold text-ink">Could not load habits</p>
        <p className="mt-1 text-sm text-inkSoft">{error}</p>
        <p className="mt-3 text-xs text-inkSoft">
          Make sure the backend is running and MongoDB is connected.
        </p>
      </div>
    )
  }

  // Empty state
  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-paperLine p-12 text-center">
        <p className="text-3xl mb-2">📋</p>
        <p className="font-display font-semibold text-ink">No habits yet</p>
        <p className="mt-1 text-sm text-inkSoft">
          Add your first habit above to start building streaks.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggleToday={onToggleToday}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
