'use client'

import axios from 'axios'
import { FormEvent, useState } from 'react'
import { API_URL } from '../api'
import type { User } from '../types'

type Props = {
  onLoggedIn: (payload: { token: string; user: User }) => void
}

export default function AuthLogin(props: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password })
      props.onLoggedIn({ token: res.data.access_token, user: res.data.user })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>School Banking System</h1>
        <form onSubmit={login}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
          </button>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>Default: admin / admin123</div>
        </form>
      </div>
    </div>
  )
}

