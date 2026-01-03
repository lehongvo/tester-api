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
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password })
            const { access_token, user } = res.data
            localStorage.setItem('token', access_token)
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
        <div className="login-page">
            <div className="login-panel">
                <div className="login-hero">
                    <div className="login-hero__badge">Student Portal</div>
                    <div className="login-hero__title">Welcome back</div>
                    <div className="login-hero__subtitle">Sign in to continue to your dashboard.</div>
                </div>

                {error && (
                    <div className="login-alert" role="alert">
                        <div className="login-alert__icon" aria-hidden="true">⚠️</div>
                        <div className="login-alert__text">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-field__label" htmlFor="username">Username</label>
                        <div className="login-field__control">
                            <span className="login-field__icon" aria-hidden="true">👤</span>
                            <input
                                id="username"
                                type="text"
                                className="login-field__input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label className="login-field__label" htmlFor="password">Password</label>
                        <div className="login-field__control">
                            <span className="login-field__icon" aria-hidden="true">🔒</span>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="login-field__input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="login-field__toggle"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={`login-submit ${loading ? 'is-loading' : ''}`} disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>

                    <div className="login-hint">
                        Don’t have an account? <span className="login-hint__strong">Ask your administrator.</span>
                    </div>
                </form>
            </div>
        </div>
    )
}
