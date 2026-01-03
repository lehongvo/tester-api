import React, { useMemo, useState } from 'react'
import { Transaction } from '../../types'

interface StudentTransactionsProps {
    myTransactions: Transaction[]
    userInfo: any
    user: any
    setSelectedTransaction: (tx: Transaction) => void
    setShowTransactionDetailModal: (show: boolean) => void
}

export const StudentTransactions: React.FC<StudentTransactionsProps> = ({
    myTransactions,
    userInfo,
    user,
    setSelectedTransaction,
    setShowTransactionDetailModal,
}) => {
    const [txFilterDateFrom, setTxFilterDateFrom] = useState('')
    const [txFilterDateTo, setTxFilterDateTo] = useState('')
    const [txFilterType, setTxFilterType] = useState('all')
    const [txFilterAmountMin, setTxFilterAmountMin] = useState('')
    const [txFilterAmountMax, setTxFilterAmountMax] = useState('')

    const filteredMyTransactions = useMemo(() => {
        return myTransactions.filter(tx => {
            // Date Filter
            if (txFilterDateFrom) {
                if (new Date(tx.createdAt) < new Date(txFilterDateFrom)) return false;
            }
            if (txFilterDateTo) {
                const nextDay = new Date(txFilterDateTo);
                nextDay.setDate(nextDay.getDate() + 1);
                if (new Date(tx.createdAt) >= nextDay) return false;
            }

            // Type Filter
            if (txFilterType !== 'all') {
                if (tx.type.toLowerCase() !== txFilterType.toLowerCase()) return false;
            }

            // Amount Filter
            const amt = Number(tx.amount);
            if (txFilterAmountMin) {
                if (amt < Number(txFilterAmountMin)) return false;
            }
            if (txFilterAmountMax) {
                if (amt > Number(txFilterAmountMax)) return false;
            }

            return true;
        });
    }, [myTransactions, txFilterDateFrom, txFilterDateTo, txFilterType, txFilterAmountMin, txFilterAmountMax]);

    return (
        <div className="animate-fade-in">
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Transaction History</h2>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Track all your financial activities and payments.</p>
                        </div>
                        <div style={{ padding: '6px 12px', background: '#eff6ff', borderRadius: '99px', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                            {filteredMyTransactions.length} / {myTransactions.length} Total
                        </div>
                    </div>

                    {/* Filters */}
                    {myTransactions.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>FROM DATE</label>
                                <input type="date" value={txFilterDateFrom} onChange={e => setTxFilterDateFrom(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>TO DATE</label>
                                <input type="date" value={txFilterDateTo} onChange={e => setTxFilterDateTo(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>TYPE</label>
                                <select value={txFilterType} onChange={e => setTxFilterType(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white' }}>
                                    <option value="all">All Types</option>
                                    <option value="payment">Payment</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="adjustment">Adjustment</option>
                                    <option value="refund">Refund</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>MIN AMOUNT</label>
                                <input type="number" placeholder="0" value={txFilterAmountMin} onChange={e => setTxFilterAmountMin(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>MAX AMOUNT</label>
                                <input type="number" placeholder="Max" value={txFilterAmountMax} onChange={e => setTxFilterAmountMax(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setTxFilterDateFrom(''); setTxFilterDateTo(''); setTxFilterType('all');
                                        setTxFilterAmountMin(''); setTxFilterAmountMax('');
                                    }}
                                    className="btn"
                                    style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {myTransactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px' }}>No transactions yet</h3>
                            <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px' }}>Your transaction history will appear here.</p>
                        </div>
                    ) : filteredMyTransactions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px' }}>Type</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMyTransactions.map((tx: any) => {
                                        // Safe date formatting
                                        let dateDisplay = 'N/A';
                                        try {
                                            if (tx.createdAt) {
                                                const date = new Date(tx.createdAt);
                                                if (!isNaN(date.getTime())) {
                                                    dateDisplay = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                                }
                                            }
                                        } catch (e) { console.error('Date error', e) }

                                        // Determine sign based on flow:
                                        const currentUserId = userInfo?.id || user?.id;
                                        let isPositive = false;
                                        if (tx.toUserId && tx.toUserId === currentUserId) isPositive = true;
                                        else if (tx.type === 'DEPOSIT' || tx.type === 'REFUND') isPositive = true;

                                        return (
                                            <tr
                                                key={tx.id}
                                                className="hover-row"
                                                onClick={() => { setSelectedTransaction(tx); setShowTransactionDetailModal(true); }}
                                                style={{ transition: 'background 0.2s', cursor: 'pointer' }}
                                            >
                                                <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span className={`status-badge status-${(tx.type || 'unknown').toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontWeight: '500' }}>
                                                    {tx.description}
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                                                    {dateDisplay}
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold', color: isPositive ? '#10b981' : '#ef4444' }}>
                                                    {isPositive ? '+' : '-'}${Math.abs(Number(tx.amount)).toFixed(2)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px' }}>No transactions yet</h3>
                            <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px' }}>Your transaction history will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
