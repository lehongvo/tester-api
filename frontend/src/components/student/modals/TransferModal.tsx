import React, { useState } from 'react'

interface TransferModalProps {
    show: boolean
    onClose: () => void
    onTransfer: (e: React.FormEvent) => Promise<void>
    transferForm: any
    setTransferForm: (form: any) => void
    transferStudentsList: any[]
    currentUserId: number
}

export const TransferModal: React.FC<TransferModalProps> = ({
    show,
    onClose,
    onTransfer,
    transferForm,
    setTransferForm,
    transferStudentsList,
    currentUserId,
}) => {
    const [transferSearchTerm, setTransferSearchTerm] = useState('')
    const [showTransferSearchConfig, setShowTransferSearchConfig] = useState(false)

    if (!show) return null

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💸 Transfer Money</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={onTransfer} style={{ padding: '20px 0' }}>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>To User ID / Name</label>
                        <input
                            type="text"
                            placeholder="Search by ID or Name"
                            value={transferSearchTerm}
                            onFocus={() => setShowTransferSearchConfig(true)}
                            onChange={(e) => {
                                setTransferSearchTerm(e.target.value)
                                setShowTransferSearchConfig(true)
                            }}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                        {/* Search Results Dropdown */}
                        {showTransferSearchConfig && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                maxHeight: '200px', overflowY: 'auto', zIndex: 10,
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                {transferStudentsList
                                    .filter(s =>
                                        s.id !== currentUserId &&
                                        (s.name.toLowerCase().includes(transferSearchTerm.toLowerCase()) ||
                                            s.id.toString().includes(transferSearchTerm))
                                    )
                                    .map(s => (
                                        <div
                                            key={s.id}
                                            className="hover-row"
                                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }}
                                            onClick={() => {
                                                setTransferForm({ ...transferForm, toUserId: s.id.toString() });
                                                setTransferSearchTerm(`${s.name} (ID: ${s.id})`);
                                                setShowTransferSearchConfig(false);
                                            }}
                                        >
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{s.name}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>#{s.id}</span>
                                        </div>
                                    ))}
                                {transferStudentsList.filter(s => s.id !== currentUserId && (s.name.toLowerCase().includes(transferSearchTerm.toLowerCase()) || s.id.toString().includes(transferSearchTerm))).length === 0 && (
                                    <div style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Amount ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={transferForm.amount}
                            onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="What is this for?"
                            value={transferForm.description}
                            onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary">Transfer</button>
                        <button type="button" onClick={onClose} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
