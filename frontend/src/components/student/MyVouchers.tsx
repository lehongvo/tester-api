import React, { useState } from 'react'
import { Course, Voucher } from '../../types'
import { VoucherDetailModal } from './modals/VoucherDetailModal'

interface MyVouchersProps {
    vouchers: Voucher[]
    courses: Course[]
}

export const MyVouchers: React.FC<MyVouchersProps> = ({ vouchers, courses }) => {
    const [showUsed, setShowUsed] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

    const availableVouchers = vouchers.filter(v => !v.used)
    const usedVouchers = vouchers.filter(v => v.used)

    const getGradient = (percent: number) => {
        if (percent >= 36) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        if (percent >= 21) return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
        return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
    }

    const getCourseName = (courseId: number | undefined) => {
        if (!courseId) return 'Unknown Course'
        const course = courses.find(c => c.id === courseId)
        return course ? course.name : `Course #${courseId}`
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const formatDate = (date: string | undefined) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const VoucherCard = ({ voucher, isUsed }: { voucher: Voucher; isUsed: boolean }) => (
        <div
            style={{
                background: isUsed
                    ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                    : getGradient(voucher.percent),
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                opacity: isUsed ? 0.7 : 1,
                transition: 'all 0.3s',
                cursor: isUsed ? 'default' : 'pointer',
            }}
            onMouseEnter={(e) => !isUsed && (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => !isUsed && (e.currentTarget.style.transform = 'translateY(0)')}
            onClick={() => setSelectedVoucher(voucher)}
        >
            {/* Status Badge */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: isUsed ? '#94a3b8' : 'rgba(255,255,255,0.25)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
            }}>
                {isUsed ? '✓ Used' : '○ Available'}
            </div>

            {/* Voucher Code */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
            }}>
                <code style={{
                    color: isUsed ? '#64748b' : 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                }}>
                    {voucher.code}
                </code>
                {!isUsed && (
                    <button
                        onClick={() => copyToClipboard(voucher.code)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        {copiedCode === voucher.code ? '✓ Copied' : '📋 Copy'}
                    </button>
                )}
            </div>

            {/* Discount */}
            <div style={{
                fontSize: '36px',
                fontWeight: 800,
                color: isUsed ? '#94a3b8' : 'white',
                marginBottom: '8px',
                lineHeight: 1,
            }}>
                {voucher.percent}%
            </div>
            <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isUsed ? '#64748b' : 'rgba(255,255,255,0.9)',
                marginBottom: isUsed ? '8px' : '0',
            }}>
                Discount
            </div>

            {/* Used Info */}
            {isUsed && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #cbd5e1',
                }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Used for: <strong>{getCourseName(voucher.usedCourseId)}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {formatDate(voucher.usedAt)}
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 800,
                marginBottom: '24px',
                color: '#1e293b',
            }}>
                🎟️ My Vouchers
            </h2>

            {/* Available Vouchers */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    Available Vouchers
                    <span style={{
                        background: '#10b981',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                    }}>
                        {availableVouchers.length}
                    </span>
                </h3>

                {availableVouchers.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '2px dashed #e2e8f0',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎟️</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>
                            No available vouchers
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                            You've used all your vouchers!
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                    }}>
                        {availableVouchers.map(voucher => (
                            <VoucherCard key={voucher.id} voucher={voucher} isUsed={false} />
                        ))}
                    </div>
                )}
            </div>

            {/* Used Vouchers */}
            {usedVouchers.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowUsed(!showUsed)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#334155',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: 0,
                        }}
                    >
                        <span>{showUsed ? '▼' : '▶'}</span>
                        Used Vouchers
                        <span style={{
                            background: '#94a3b8',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                        }}>
                            {usedVouchers.length}
                        </span>
                    </button>

                    {showUsed && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px',
                        }}>
                            {usedVouchers.map(voucher => (
                                <VoucherCard key={voucher.id} voucher={voucher} isUsed={true} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <VoucherDetailModal
                show={!!selectedVoucher}
                onClose={() => setSelectedVoucher(null)}
                voucher={selectedVoucher}
                courses={courses}
            />
        </div>
    )
}
