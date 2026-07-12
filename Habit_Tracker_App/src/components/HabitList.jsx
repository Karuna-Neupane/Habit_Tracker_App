import { ClipboardList } from 'lucide-react'
import HabitCard from './HabitCard.jsx'

export default function HabitList({ habits, onToggleToday, onEdit, onDelete }) {
  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-paperLine p-12 text-center">
        <ClipboardList className="mx-auto mb-2 h-8 w-8 text-inkSoft" aria-hidden="true" />
        <p className="font-display font-semibold text-ink">No habits yet</p>
        <p className="mt-1 text-sm text-inkSoft">
          Add your first habit above to start building your streak.
        </p>
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
