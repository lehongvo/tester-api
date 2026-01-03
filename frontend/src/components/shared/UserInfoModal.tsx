import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { User } from '../../types'
import { API_URL, getAuthHeaders } from '../../utils/api'

interface UserInfoModalProps {
    show: boolean
    onClose: () => void
    user: User | null
    userInfo: any
    loading: boolean
    onProfileUpdate: (updatedUser: any) => void
    setNotification: (n: any) => void
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
    show,
    onClose,
    user,
    userInfo,
    loading,
    onProfileUpdate,
    setNotification,
}) => {
    const [view, setView] = useState<'view' | 'edit' | 'password'>('view')
    const [profileForm, setProfileForm] = useState({ email: '', fullName: '' })
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
    const [profileSaving, setProfileSaving] = useState(false)

    const mergedUser = useMemo(() => {
        return { ...(user || {}), ...(userInfo || {}) } as any
    }, [user, userInfo])

    // Sync forms with userInfo when it changes
    useEffect(() => {
        if (mergedUser) {
            setProfileForm({
                email: mergedUser.email || '',
                fullName: mergedUser.fullName || '',
            })
        }
    }, [mergedUser])

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileSaving(true)
        try {
            const res = await axios.patch(
                `${API_URL}/auth/me`,
                {
                    email: profileForm.email || null,
                    fullName: profileForm.fullName || null,
                },
                { headers: getAuthHeaders() },
            )
            onProfileUpdate(res.data)
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Profile updated',
                message: 'Your profile information has been updated successfully.',
            })
            setView('view')
        } catch (err: any) {
            setNotification({
                show: true,
                type: 'error',
                title: '❌ Update failed',
                message: err.response?.data?.message || 'Failed to update profile',
            })
        } finally {
            setProfileSaving(false)
        }
    }

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileSaving(true)
        try {
            await axios.patch(
                `${API_URL}/auth/me/password`,
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                },
                { headers: getAuthHeaders() },
            )
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Password updated',
                message: 'Your password has been updated successfully.',
            })
            setPasswordForm({ currentPassword: '', newPassword: '' })
            setView('view')
        } catch (err: any) {
            setNotification({
                show: true,
                type: 'error',
                title: '❌ Update failed',
                message: err.response?.data?.message || 'Failed to update password',
            })
        } finally {
            setProfileSaving(false)
        }
    }

    if (!show) return null

    const avatarLetter = String(mergedUser?.username || mergedUser?.fullName || 'U').charAt(0).toUpperCase()

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal__header">
                    <div className="profile-modal__title">User Profile</div>
                    <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close">×</button>
                </div>

                {loading ? (
                    <div className="loading" style={{ margin: '40px auto' }} />
                ) : (
                    <div className="profile-modal__body">
                        <div className="profile-modal__hero">
                            <div className="profile-modal__avatar" aria-hidden="true">{avatarLetter}</div>
                            <div className="profile-modal__hero-meta">
                                <div className="profile-modal__name">{mergedUser?.fullName || mergedUser?.username || '—'}</div>
                                <div className="profile-modal__sub">
                                    <span className="chip chip-primary">Role: {String(mergedUser?.role || '—')}</span>
                                    <span className="chip chip-muted">ID: {mergedUser?.id ?? '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-modal__grid">
                            <div className="profile-field">
                                <div className="profile-field__label">Username</div>
                                <div className="profile-field__value">{mergedUser?.username || '—'}</div>
                            </div>
                            <div className="profile-field">
                                <div className="profile-field__label">Email</div>
                                <div className="profile-field__value">{mergedUser?.email || '—'}</div>
                            </div>
                            <div className="profile-field">
                                <div className="profile-field__label">Student ID</div>
                                <div className="profile-field__value">{mergedUser?.studentId || '—'}</div>
                            </div>
                            <div className="profile-field">
                                <div className="profile-field__label">Full name</div>
                                <div className="profile-field__value">{mergedUser?.fullName || '—'}</div>
                            </div>
                        </div>

                        <div className="profile-modal__tabs">
                            <button type="button" className={`profile-tab ${view === 'view' ? 'active' : ''}`} onClick={() => setView('view')}>Overview</button>
                            <button type="button" className={`profile-tab ${view === 'edit' ? 'active' : ''}`} onClick={() => setView('edit')}>Edit profile</button>
                            <button type="button" className={`profile-tab ${view === 'password' ? 'active' : ''}`} onClick={() => setView('password')}>Change password</button>
                        </div>

                        {view === 'edit' ? (
                            <form className="profile-card" onSubmit={saveProfile}>
                                <div className="profile-card__title">Update profile</div>
                                <div className="profile-form">
                                    <div className="profile-form__group">
                                        <label className="profile-form__label">Email</label>
                                        <input
                                            type="email"
                                            className="profile-form__input"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="profile-form__group">
                                        <label className="profile-form__label">Full name</label>
                                        <input
                                            type="text"
                                            className="profile-form__input"
                                            value={profileForm.fullName}
                                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="profile-modal__actions">
                                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>Save</button>
                                    <button type="button" className="btn" onClick={() => setView('view')} style={{ background: '#f3f4f6', color: '#111827' }} disabled={profileSaving}>Cancel</button>
                                </div>
                            </form>
                        ) : null}

                        {view === 'password' ? (
                            <form className="profile-card" onSubmit={changePassword}>
                                <div className="profile-card__title">Change password</div>
                                <div className="profile-form">
                                    <div className="profile-form__group">
                                        <label className="profile-form__label">Current password</label>
                                        <input
                                            type="password"
                                            className="profile-form__input"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="profile-form__group">
                                        <label className="profile-form__label">New password</label>
                                        <input
                                            type="password"
                                            className="profile-form__input"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="profile-modal__actions">
                                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>Update password</button>
                                    <button type="button" className="btn" onClick={() => setView('view')} style={{ background: '#f3f4f6', color: '#111827' }} disabled={profileSaving}>Cancel</button>
                                </div>
                            </form>
                        ) : null}

                        {view === 'view' ? (
                            <div className="profile-modal__actions">
                                <button type="button" className="btn btn-primary" onClick={() => setView('edit')} disabled={profileSaving}>Edit profile</button>
                                <button type="button" className="btn" onClick={() => setView('password')} style={{ background: '#f3f4f6', color: '#111827' }} disabled={profileSaving}>Change password</button>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}
