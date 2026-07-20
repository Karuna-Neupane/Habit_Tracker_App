// Shared Axios client — Week 5
// Every request automatically carries `Authorization: Bearer <token>` if
// we have one stashed in localStorage. This is what lets the Express
// verifyToken middleware identify the user on both /api/auth/me and every
// /api/habits/* call, without every context re-implementing the header.

import axios from 'axios'

export const TOKEN_KEY = 'habitTracker.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
