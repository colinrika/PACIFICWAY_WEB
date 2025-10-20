import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading, error } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const ok = await register({ name, email, password, role })
    if (ok) navigate('/me')
  }

  return (
    <div>
      <h2>Register</h2>
      {error && <div className='alert'>{error}</div>}
      <form onSubmit={submit} className='row'>
        <div className='col'>
          <input
            placeholder='Full name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
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
        </div>
        <div className='col'>
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value='customer'>Customer</option>
            <option value='provider'>Provider</option>
            <option value='job_seeker'>Job Seeker</option>
            <option value='agent'>Agent</option>
          </select>
        </div>
        <div className='col' style={{ alignSelf: 'end' }}>
          <button disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>
    </div>
  )
}
