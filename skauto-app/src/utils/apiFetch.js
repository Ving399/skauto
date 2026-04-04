// src/utils/apiFetch.js
import { supabase } from '../supabaseClient'

export async function apiFetch(endpoint, options = {}) {

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch(`http://localhost:3001${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })

  return response.json()
}