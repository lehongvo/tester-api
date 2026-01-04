import React, { useMemo, useState } from 'react'
import { Voucher } from '../../types'

interface VoucherManagementProps {
    vouchers: Voucher[]
    students: any[]
    loading: boolean
}

export const VoucherManagement: React.FC<VoucherManagementProps> = ({
    vouchers,
    students,
    loading,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterUserId, setFilterUserId] = useState<number | null>(null)
    const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'available'>('all')

    const filteredVouchers = useMemo(() => {
        return vouchers.filter(voucher => {
            // Search filter
            if (searchTerm && !voucher.code.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false
            }
            // User filter
            if (filterUserId && voucher.userId !== filterUserId) {
                return false
            }
            // Status filter
            if (filterStatus === 'used' && !voucher.used) return false
            if (filterStatus === 'available' && voucher.used) return false

            return true
        })
    }, [vouchers, searchTerm, filterUserId, filterStatus])

    const getStudentName = (userId: number) => {
        const student = students.find(s => s.userId === userId)
        return student ? `${student.name} (${student.studentId || 'N/A'})` : `User #${userId}`
    }

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="admin-panel">
            <div className="admin-panel__header">
                <h2 className="admin-panel__title">
                    🎟️ Voucher Management
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginLeft: '12px' }}>
                        Showing {filteredVouchers.length} of {vouchers.length}
                    </span>
                </h2>
                <div className="admin-panel__actions">
                    <div className="admin-panel__search">
                        <span className="admin-panel__search-icon">🔍</span>
                        <input
                            type="text"
                            className="admin-panel__search-input"
                            placeholder="Search by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterUserId || ''}
                        onChange={(e) => setFilterUserId(e.target.value ? parseInt(e.target.value) : null)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            background: '#f8fafc',
                        }}
                    >
                        <option value="">All Students</option>
                        {students.map(s => (
                            <option key={s.userId} value={s.userId}>
                                {s.name} ({s.studentId || 'N/A'})
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            background: '#f8fafc',
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="used">Used</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading vouchers...
                </div>
            ) : filteredVouchers.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎟️</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                        No vouchers found
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                        {searchTerm || filterUserId || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Vouchers will appear here when students are created'}
                    </div>
                </div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Student</th>
                            <th>Discount</th>
                            <th>Status</th>
                            <th>Used For</th>
                            <th>Used Date</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVouchers.map(voucher => (
                            <tr key={voucher.id}>
                                <td>
                                    <code style={{
                                        background: '#f1f5f9',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#4f46e5',
                                    }}>
                                        {voucher.code}
                                    </code>
                                </td>
                                <td>{getStudentName(voucher.userId)}</td>
                                <td>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        background: voucher.percent >= 36
                                            ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                                            : voucher.percent >= 21
                                                ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                                                : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        {voucher.percent}%
                                    </span>
                                </td>
                                <td>
                                    <span className={`admin-status ${voucher.used ? 'admin-status--adjustment' : 'admin-status--payment'}`}>
                                        {voucher.used ? '✓ Used' : '○ Available'}
                                    </span>
                                </td>
                                <td>
                                    {voucher.usedCourseId ? `Course #${voucher.usedCourseId}` : '-'}
                                </td>
                                <td>{formatDate(voucher.usedAt)}</td>
                                <td>{formatDate(voucher.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
