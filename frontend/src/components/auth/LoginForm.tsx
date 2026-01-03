import axios from 'axios'
import React, { useState } from 'react'
import { User } from '../../types'
import { API_URL } from '../../utils/api'

interface LoginFormProps {
    onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password })
            const { token, user } = res.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            onLogin(user)
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">🔐</div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your student portal</p>
                </div>

                {error && (
                    <div className="login-alert">
                        <span className="login-alert-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label" htmlFor="username">Username</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">👤</span>
                            <input
                                id="username"
                                type="text"
                                className="login-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label className="login-label" htmlFor="password">Password</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">🔒</span>
                            <input
                                id="password"
                                type="password"
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                        {!loading && <span className="login-arrow">→</span>}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? Ask your administrator.</p>
                </div>
            </div>
        </div>
    )
}
