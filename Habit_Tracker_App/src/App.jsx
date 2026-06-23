export default function App() {
  return (
    <div>
      <Title />
      <HabitCard />
    </div>
  );
}

export function Title() {
  return (
    <div>
      <h1 className="text-red-500 text-3xl p-10">Habit Tracker</h1>
    </div>
  );
}

export function HabitCard() {
  return (
    <div>
    <div className="mt-10 p-4 border">
      <h2 className="text-xl text-blue-500">Drink Water</h2>
      <p>Streak: 3 days</p>
    </div>

    <div className="mt-10 p-4 border">
      <h2 className="text-xl text-blue-500">Study</h2>
      <p>Streak: 4 days</p>
    </div>
    </div>
  );

}




