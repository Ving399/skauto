// src/utils/apiFetch.js
import { supabase } from '../supabaseClient'

export async function apiFetch(endpoint, options = {}) {

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })

  return response.json()
}