import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { todayKey } from '../utils/streak.js'

// Create the Context
const HabitsContext = createContext(null)

// API base URL (proxied by Vite in dev, same origin in production) 
const API = '/api/habits'

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // For 204 No Content (DELETE success) there's no JSON body
  if (res.status === 204) return null

  const data = await res.json()

  // Surface server-side errors so callers can show them to the user
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`
    throw Object.assign(new Error(message), { status: res.status, data })
  }

  return data
}

// Provide the Context 
export function HabitsProvider({ children }) {
  const [habits,  setHabits]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Load all habits from the API on mount
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch(API)
      setHabits(data.habits)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  // Toggle today's completion (POST or DELETE /complete)
  async function toggleToday(habitId) {
    const habit = habits.find(h => h.id === habitId)
    const today = todayKey()
    const alreadyDone = habit?.completions.includes(today)

    try {
      const method = alreadyDone ? 'DELETE' : 'POST'
      const updated = await apiFetch(`${API}/${habitId}/complete`, {
        method,
        body: { date: today },
      })
      // Replace the one updated habit in local state immediately (no full refetch)
      setHabits(prev => prev.map(h => h.id === habitId ? updated : h))
    } catch (err) {
      setError(err.message)
    }
  }

  // Add a new habit
  async function addHabit({ name, frequency }) {
    try {
      const newHabit = await apiFetch(API, {
        method: 'POST',
        body: { name, frequency },
      })
      setHabits(prev => [...prev, newHabit])
    } catch (err) {
      setError(err.message)
      throw err   // re-throw so the form can show the server error message
    }
  }

  // Edit an existing habit
  async function editHabit(habitId, { name, frequency }) {
    try {
      const updated = await apiFetch(`${API}/${habitId}`, {
        method: 'PUT',
        body: { name, frequency },
      })
      setHabits(prev => prev.map(h => h.id === habitId ? updated : h))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Delete a habit 
  async function deleteHabit(habitId) {
    try {
      await apiFetch(`${API}/${habitId}`, { method: 'DELETE' })
      setHabits(prev => prev.filter(h => h.id !== habitId))
    } catch (err) {
      setError(err.message)
    }
  }

  const value = {
    habits,
    loading,
    error,
    toggleToday,
    addHabit,
    editHabit,
    deleteHabit,
    refetch: fetchHabits,
  }

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  )
}

// Custom hook to consume the Context 
export function useHabits() {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits must be used inside <HabitsProvider>')
  return ctx
}
