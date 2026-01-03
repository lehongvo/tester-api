import React from 'react'

interface ConfirmModalProps {
    show: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    if (!show) return null

    return (
        <div className="modal" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                <div style={{ padding: '20px 0', fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                    {message}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn"
                        style={{ background: '#f0f0f0', color: '#333' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn btn-primary"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}
