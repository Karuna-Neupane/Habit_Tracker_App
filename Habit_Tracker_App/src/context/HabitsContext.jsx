// HabitsContext — Week 4
// Replaced native fetch() with Axios (Tutorial PDF, "Using Axios for API Integration").
// All habit data now persists in MongoDB Atlas via the Express backend.
// Streak computation uses live completions from the database (item 4).

import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { todayKey } from '../utils/streak.js'

const HabitsContext = createContext(null)

// Axios instance — base URL proxied by Vite to http://localhost:3000
const api = axios.create({
  baseURL: '/api/habits',
  headers: { 'Content-Type': 'application/json' },
})

// ── Provide the Context ────────────────────────────────────────────────────
export function HabitsProvider({ children }) {
  const [habits,  setHabits]  = useState([])
  const [loading, setLoading] = useState(true)   // drives loading skeleton
  const [error,   setError]   = useState(null)

  // Week 4, item 3: fetch habits from MongoDB via Axios
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/')           // GET /api/habits
      setHabits(data.habits)                        // completions come from DB
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  // ── Toggle today — POST or DELETE /complete in MongoDB ──────────────────
  // Week 4, item 4: streak is recomputed server-side from live DB completions
  async function toggleToday(habitId) {
    const habit    = habits.find((h) => h.id === habitId)
    const today    = todayKey()
    const doneTday = habit?.completions.includes(today)

    try {
      const { data: updated } = doneTday
        ? await api.delete(`/${habitId}/complete`, { data: { date: today } })
        : await api.post(`/${habitId}/complete`, { date: today })

      setHabits((prev) => prev.map((h) => h.id === habitId ? updated : h))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  // ── Add habit — POST to MongoDB ─────────────────────────────────────────
  async function addHabit({ name, frequency }) {
    try {
      const { data: newHabit } = await api.post('/', { name, frequency })
      setHabits((prev) => [...prev, newHabit])
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      throw new Error(msg)
    }
  }

  // ── Edit habit — PUT to MongoDB ─────────────────────────────────────────
  async function editHabit(habitId, { name, frequency }) {
    try {
      const { data: updated } = await api.put(`/${habitId}`, { name, frequency })
      setHabits((prev) => prev.map((h) => h.id === habitId ? updated : h))
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      throw new Error(msg)
    }
  }

  // ── Delete habit — DELETE from MongoDB ──────────────────────────────────
  async function deleteHabit(habitId) {
    try {
      await api.delete(`/${habitId}`)
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <HabitsContext.Provider value={{
      habits, loading, error,
      toggleToday, addHabit, editHabit, deleteHabit,
      refetch: fetchHabits,
    }}>
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits() {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits must be used inside <HabitsProvider>')
  return ctx
}
