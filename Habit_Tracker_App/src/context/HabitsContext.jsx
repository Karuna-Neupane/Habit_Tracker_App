// HabitsContext — Week 5
// Habits are now private per user (item 3): the backend scopes every query
// to req.user.id, decoded from the JWT that the shared `api` client
// (utils/api.js) automatically attaches to every request. This context only
// needs to know *when* to fetch — on login — and *when to stop* — on logout,
// so one user's data never lingers on screen after another signs in.

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../utils/api.js'
import { useAuth } from './AuthContext.jsx'
import { todayKey } from '../utils/streak.js'

const HabitsContext = createContext(null)

// ── Provide the Context ────────────────────────────────────────────────────
export function HabitsProvider({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const [habits,  setHabits]  = useState([])
  const [loading, setLoading] = useState(true)   // drives loading skeleton
  const [error,   setError]   = useState(null)

  // Fetch habits from MongoDB — only ever the current user's own habits,
  // enforced server-side by the verifyToken + userId scoping.
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/habits')          // GET /api/habits
      setHabits(data.habits)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch when a user is signed in; clear out immediately on logout so the
  // next visitor never glimpses the previous user's habit list.
  useEffect(() => {
    if (initializing) return
    if (isAuthenticated) {
      fetchHabits()
    } else {
      setHabits([])
      setLoading(false)
    }
  }, [isAuthenticated, initializing, fetchHabits])

  // ── Toggle today — POST or DELETE /complete in MongoDB ──────────────────
  async function toggleToday(habitId) {
    const habit    = habits.find((h) => h.id === habitId)
    const today    = todayKey()
    const doneTday = habit?.completions.includes(today)

    try {
      const { data: updated } = doneTday
        ? await api.delete(`/habits/${habitId}/complete`, { data: { date: today } })
        : await api.post(`/habits/${habitId}/complete`, { date: today })

      setHabits((prev) => prev.map((h) => h.id === habitId ? updated : h))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  // ── Add habit — POST to MongoDB ─────────────────────────────────────────
  async function addHabit({ name, frequency }) {
    try {
      const { data: newHabit } = await api.post('/habits', { name, frequency })
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
      const { data: updated } = await api.put(`/habits/${habitId}`, { name, frequency })
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
      await api.delete(`/habits/${habitId}`)
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
