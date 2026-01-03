import React from 'react'

interface CreateCourseModalProps {
    show: boolean
    onClose: () => void
    form: any
    setForm: (form: any) => void
    onSubmit: (e: React.FormEvent) => void
    error: string
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
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
                    <h2>📝 Create Course</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Course Name <span>*</span></label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Price (USD) <span>*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            className="admin-form-input"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Instructor</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.instructor}
                            onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Duration</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.duration}
                            onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="admin-btn admin-btn--primary">Create</button>
                        <button type="button" onClick={onClose} className="admin-btn admin-btn--secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
