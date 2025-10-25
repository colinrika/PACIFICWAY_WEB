const API_BASE = [
  import.meta.env.VITE_API_BASE,
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_BACKEND_URL,
  import.meta.env.VITE_APP_API_BASE,
  import.meta.env.VITE_APP_API_URL
]
  .map(value => (value || '').trim())
  .find(Boolean)

const sanitizeBase = value => (value || '').replace(/\/$/, '')

const computeCodespacesBase = () => {
  if (typeof window === 'undefined') return ''

  const { protocol, hostname, host } = window.location

  if (/^localhost$/i.test(hostname) || /^127\.0\.0\.1$/.test(hostname)) {
    const baseProtocol = protocol === 'https:' ? 'https' : 'http'
    return `${baseProtocol}://${hostname}:4000`
  }

  const match = host.match(/^(.*)-\d+\.app\.github\.dev$/)
  if (!match) return ''

  return `https://${match[1]}-4000.app.github.dev`
}

const resolveBaseCandidates = () => {
  const candidates = []

  const envBase = sanitizeBase(API_BASE)
  if (envBase) candidates.push(envBase)

  const codespacesBase = sanitizeBase(computeCodespacesBase())

  if (import.meta.env.DEV) {
    candidates.push('')
    if (codespacesBase) candidates.push(codespacesBase)
  } else {
    if (codespacesBase) candidates.push(codespacesBase)
    candidates.push('')
  }

  return [...new Set(candidates)]
}

const baseCandidates = resolveBaseCandidates()

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

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  let lastError = new Error('Request failed')

  for (const base of baseCandidates) {
    const url = base ? `${base}${normalizedPath}` : normalizedPath

    let response
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      })
    } catch (err) {
      lastError = new Error(normalizeErrorMessage(err?.message))
      continue
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() || ''

    if (!response.ok) {
      const isHtmlLike =
        contentType.includes('text/html') ||
        contentType.includes('text/plain') ||
        contentType === ''

      if (
        isHtmlLike &&
        ((response.status >= 500 && response.status < 600) ||
          (!base && response.status === 404))
      ) {
        // The host likely served an HTML error page instead of the API response
        // (commonly a dev proxy miss or upstream failure). Try the next base
        // candidate to fall back to the Codespaces / configured API origin.
        continue
      }

      let errorPayload = {}

      if (contentType.includes('application/json')) {
        errorPayload = await response.json().catch(() => ({}))
      } else {
        const text = await response.text().catch(() => '')
        if (text) errorPayload = { message: text }
      }

      const rawMessage =
        errorPayload?.error ||
        errorPayload?.message ||
        errorPayload?.detail ||
        `Request failed (${response.status})`

      lastError = new Error(normalizeErrorMessage(rawMessage))
      continue
    }

    const data = await response.json().catch(() => ({}))
    return data
  }

  throw lastError
}
