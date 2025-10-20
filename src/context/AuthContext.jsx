import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

const normalizeUser = raw => {
  if (!raw) return null

  const candidates = [
    raw.user,
    raw.data?.user,
    raw.data?.profile,
    raw.data?.data?.user,
    raw.data?.data,
    raw.profile,
    raw.account,
    raw.result?.user,
    raw.result,
    raw
  ]

  const userData = candidates.find(candidate => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return false
    }
    const keys = Object.keys(candidate)
    return keys.some(k =>
      ['id', 'user_id', 'uuid', 'name', 'full_name', 'user_name', 'email', 'user_email'].includes(k)
    )
  })

  if (!userData) return null

  return {
    id: userData.id ?? userData.user_id ?? userData.uuid ?? userData.userId ?? '',
    name:
      userData.name ??
      userData.full_name ??
      userData.user_name ??
      userData.display_name ??
      [userData.first_name, userData.last_name].filter(Boolean).join(' ') ??
      '',
    email:
      userData.email ??
      userData.user_email ??
      userData.username ??
      userData.email_address ??
      userData.mail ??
      '',
    role:
      userData.role ??
      userData.user_role ??
      userData.type ??
      userData.account_type ??
      userData.role_name ??
      userData.userType ??
      ''
  }
}

const extractToken = raw =>
  raw?.token ??
  raw?.access_token ??
  raw?.data?.token ??
  raw?.data?.access_token ??
  raw?.data?.jwt ??
  ''

export const useAuth = () => useContext(AuthContext)

export default function Provider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token')
      setUser(null)
      return
    }

    localStorage.setItem('token', token)
    api('/users/me', { token })
      .then(response => {
        const normalized = normalizeUser(response)
        setUser(normalized)
      })
      .catch(() => setUser(null))
  }, [token])

  const login = async (email, password) => {
    setError('')
    setLoading(true)
    try {
      const body = {
        email,
        user_email: email,
        username: email,
        password,
        user_password: password
      }
      const response = await api('/auth/login', { method: 'POST', body })
      const nextToken = extractToken(response)
      if (nextToken) {
        setToken(nextToken)
      }
      const nextUser = normalizeUser(response)
      if (nextUser) setUser(nextUser)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async payload => {
    setError('')
    setLoading(true)
    try {
      const body = {
        name: payload.name,
        full_name: payload.name,
        user_name: payload.name,
        email: payload.email,
        user_email: payload.email,
        password: payload.password,
        user_password: payload.password,
        role: payload.role,
        user_role: payload.role,
        type: payload.role
      }
      const response = await api('/auth/register', { method: 'POST', body })
      const nextToken = extractToken(response)
      if (nextToken) setToken(nextToken)
      const nextUser = normalizeUser(response)
      if (nextUser) setUser(nextUser)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
