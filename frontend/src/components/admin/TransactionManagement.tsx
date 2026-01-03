import React, { useMemo, useState } from 'react'
import { Transaction } from '../../types'

interface TransactionManagementProps {
    transactions: Transaction[]
    loading: boolean
    setNotification: (n: any) => void
}

export const TransactionManagement: React.FC<TransactionManagementProps> = ({
    transactions,
    loading,
    setNotification,
}) => {
    const [filter, setFilter] = useState('')

    const filteredTransactions = useMemo(() => {
        const q = filter.trim().toLowerCase()
        if (!q) return transactions
        return transactions.filter((t) =>
            [t.type, t.description, String(t.id), String(t.fromUserId || ''), String(t.toUserId || ''), String(t.amount)]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        )
    }, [transactions, filter])

    return (
        <div className="admin-panel">
            <div className="admin-panel__header">
                <h3 className="admin-panel__title">💳 Transaction History</h3>
                <div className="admin-panel__actions">
                    <div className="admin-panel__search">
                        <span className="admin-panel__search-icon">🔍</span>
                        <input
                            type="text"
                            className="admin-panel__search-input"
                            placeholder="Search transactions..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading"></div>
            ) : filteredTransactions.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty__icon">💳</div>
                    <h4 className="admin-empty__title">No transactions found</h4>
                    <p className="admin-empty__text">
                        {filter ? 'Try adjusting your search.' : 'Transactions will appear here.'}
                    </p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((tx) => (
                                <tr
                                    key={tx.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setNotification({
                                            show: true,
                                            type: 'info',
                                            title: '💳 Transaction Detail',
                                            message: `#${tx.id} • ${tx.type} • $${tx.amount} • From ${tx.fromUserId || '—'} → To ${tx.toUserId || '—'}${tx.description ? ` • ${tx.description}` : ''}`,
                                        })
                                    }}
                                >
                                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{tx.id}</td>
                                    <td>
                                        <span className={`admin-status admin-status--${tx.type}`}>
                                            {tx.type === 'transfer' && '↔️'}
                                            {tx.type === 'payment' && '💰'}
                                            {tx.type === 'adjustment' && '⚙️'}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td>{tx.fromUserId || '—'}</td>
                                    <td>{tx.toUserId || '—'}</td>
                                    <td style={{ fontWeight: 700 }}>${tx.amount}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tx.description || '—'}
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
