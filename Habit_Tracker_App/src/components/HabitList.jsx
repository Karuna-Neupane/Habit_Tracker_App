import HabitCard from './HabitCard.jsx'

export default function HabitList({ habits, onToggleToday, onEdit, onDelete }) {
  if (habits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-paperLine p-10 text-center text-inkSoft">
        No habits added yet. Add your first one above to start a streak.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
