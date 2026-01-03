import React from 'react'

interface CreateStudentModalProps {
    show: boolean
    onClose: () => void
    form: any
    setForm: (form: any) => void
    onSubmit: (e: React.FormEvent) => void
    error: string
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
    show,
    onClose,
    form,
    setForm,
    onSubmit,
    error,
}) => {
    if (!show) return null

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>➕ Create Student User</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Username <span>*</span></label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Email <span>*</span></label>
                        <input
                            type="email"
                            className="admin-form-input"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Full Name <span>*</span></label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Password (optional - auto-generated if empty)</label>
                        <input
                            type="password"
                            className="admin-form-input"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Age</label>
                            <input
                                type="number"
                                className="admin-form-input"
                                value={form.age}
                                onChange={(e) => setForm({ ...form, age: e.target.value })}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Address</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="admin-btn admin-btn--primary">Create Student</button>
                        <button type="button" onClick={onClose} className="admin-btn admin-btn--secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
