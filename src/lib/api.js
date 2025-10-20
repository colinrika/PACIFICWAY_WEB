const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

const normalizeErrorMessage = message => {
  if (!message) return 'Request failed'

  if (
    message.includes(
      'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received'
    )
  ) {
    return 'The browser blocked the request before the API responded. Try again or disable interfering extensions.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Could not reach the API server. Check your connection or VITE_API_BASE setting.'
  }

  return message
}

export async function api(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const url = `${API_BASE}${path}`

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
  } catch (err) {
    throw new Error(normalizeErrorMessage(err?.message))
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const rawMessage =
      data?.error || data?.message || data?.detail || `Request failed (${response.status})`
    throw new Error(normalizeErrorMessage(rawMessage))
  }

  return data
}
