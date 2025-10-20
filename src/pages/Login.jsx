import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/me')
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <div className='alert'>{error}</div>}
      <form onSubmit={submit}>
        <input
          placeholder='Email'
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          placeholder='Password'
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  )
}
