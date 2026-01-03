import React from 'react'

interface SetBalanceModalProps {
    show: boolean
    onClose: () => void
    form: any
    setForm: (form: any) => void
    onSubmit: (e: React.FormEvent) => void
    error: string
}

export const SetBalanceModal: React.FC<SetBalanceModalProps> = ({
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
                    <h2>💰 Set Student Balance</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">New Balance ($) <span>*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            className="admin-form-input"
                            value={form.balance}
                            onChange={(e) => setForm({ ...form, balance: e.target.value })}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Description / Reason</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g. Tuition adjustment, Deposit"
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="admin-btn admin-btn--primary">Update Balance</button>
                        <button type="button" onClick={onClose} className="admin-btn admin-btn--secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
