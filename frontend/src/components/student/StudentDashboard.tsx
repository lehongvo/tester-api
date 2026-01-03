import React, { useState } from 'react'

interface StudentDashboardProps {
    userInfo: any
    user: any
    account: any
    myEnrollments: any[]
    myTransactions: any[]
    setShowTransferModal: (show: boolean) => void
    setActiveTab: (tab: string) => void
    setSelectedTransaction: (tx: any) => void
    setShowTransactionDetailModal: (show: boolean) => void
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
    userInfo,
    user,
    account,
    myEnrollments,
    myTransactions,
    setShowTransferModal,
    setActiveTab,
    setSelectedTransaction,
    setShowTransactionDetailModal,
}) => {
    const [dashboardTxSearch, setDashboardTxSearch] = useState('')

    return (
        <div className="animate-fade-in">
            {/* Top Hero Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                {/* Transfer Money Hero Card */}
                <div
                    onClick={() => setShowTransferModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '16px',
                        padding: '32px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className="hover-scale"
                >
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                        pointerEvents: 'none'
                    }}></div>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>TRANSFER MONEY</h2>
                    <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Click to start a new transfer</p>
                </div>

                {/* Total Enrollments */}
                <div
                    onClick={() => setActiveTab('enrollments')}
                    className="hover-card"
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        📈 Total Enrollments
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#3b82f6' }}>
                        {myEnrollments.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Click to view details</div>
                </div>

                {/* Total Transactions */}
                <div
                    onClick={() => setActiveTab('history')}
                    className="hover-card"
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        📜 Total Transactions
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#10b981' }}>
                        {myTransactions.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Lifetime activity</div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>📜 Recent Transactions</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Overview of your latest financial activity.</p>
                    </div>
                    <button
                        onClick={() => setActiveTab('history')}
                        className="btn"
                        style={{ background: '#4f46e5', color: 'white', padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                    >
                        VIEW ALL
                    </button>
                </div>

                {/* Dashboard Quick Search */}
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search recent transactions..."
                        value={dashboardTxSearch}
                        onChange={(e) => setDashboardTxSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            background: '#f8fafc'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                        const filtered = myTransactions.filter((tx: any) =>
                            (tx.description || '').toLowerCase().includes(dashboardTxSearch.toLowerCase()) ||
                            (tx.type || '').toLowerCase().includes(dashboardTxSearch.toLowerCase())
                        );

                        return filtered.length > 0 ? (
                            filtered.slice(0, 5).map((tx: any, index: number) => {
                                // Sign Logic
                                const currentUserId = userInfo?.id || user?.id;
                                let isPositive = false;
                                if (tx.toUserId && tx.toUserId === currentUserId) isPositive = true;
                                else if (tx.type === 'DEPOSIT' || tx.type === 'REFUND') isPositive = true;

                                return (
                                    <div
                                        key={tx.id}
                                        onClick={() => { setSelectedTransaction(tx); setShowTransactionDetailModal(true); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 0',
                                            borderBottom: index < filtered.slice(0, 5).length - 1 ? '1px solid #f1f5f9' : 'none',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        className="hover-bg-slate-50"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '42px', height: '42px', borderRadius: '50%',
                                                background: isPositive ? '#ecfdf5' : '#fef2f2',
                                                color: isPositive ? '#10b981' : '#ef4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                                                flexShrink: 0
                                            }}>
                                                {isPositive ? '↓' : '↑'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '2px', fontSize: '14px' }}>
                                                    {tx.description || 'No description'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: isPositive ? '#10b981' : '#ef4444' }}>
                                            {isPositive ? '+' : '-'}${Math.abs(Number(tx.amount)).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                No transactions found matching "{dashboardTxSearch}".
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}
