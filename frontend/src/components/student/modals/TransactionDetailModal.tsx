import React from 'react'
import { Transaction } from '../../../types'

interface TransactionDetailModalProps {
    show: boolean
    onClose: () => void
    selectedTransaction: Transaction | null
    currentUserId: number
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    show,
    onClose,
    selectedTransaction,
    currentUserId,
}) => {
    if (!show || !selectedTransaction) return null

    const isPositive = (selectedTransaction.toUserId === currentUserId || ['DEPOSIT', 'REFUND'].includes(selectedTransaction.type))

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '20px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Transaction Details</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>#{selectedTransaction.id}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            fontSize: '32px', fontWeight: '800',
                            color: isPositive ? '#10b981' : '#ef4444',
                            marginBottom: '8px'
                        }}>
                            {isPositive ? '+' : '-'}${Math.abs(Number(selectedTransaction.amount)).toFixed(2)}
                        </div>
                        <div className={`status-badge status-${(selectedTransaction.type || 'unknown').toLowerCase()}`} style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
                            {selectedTransaction.type}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Date</span>
                            <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600' }}>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Description</span>
                            <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{selectedTransaction.description}</span>
                        </div>
                        {selectedTransaction.fromUserId && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>From User ID</span>
                                <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600' }}>#{selectedTransaction.fromUserId}</span>
                            </div>
                        )}
                        {selectedTransaction.toUserId && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>To User ID</span>
                                <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600' }}>#{selectedTransaction.toUserId}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
