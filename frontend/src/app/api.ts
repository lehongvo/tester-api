import axios from 'axios'

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return `http://${host}:3001`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

export const API_URL = getApiUrl()

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const api = axios.create({
  baseURL: API_URL,
})

