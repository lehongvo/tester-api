import React, { useState } from 'react'
import { Course, Voucher } from '../../../types'

interface VoucherDetailModalProps {
    show: boolean
    onClose: () => void
    voucher: Voucher | null
    courses: Course[]
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
    show,
    onClose,
    voucher,
    courses,
}) => {
    const [copied, setCopied] = useState(false)

    if (!show || !voucher) return null

    const getCourseName = (courseId: number | undefined) => {
        if (!courseId) return 'Unknown Course'
        const course = courses.find(c => c.id === courseId)
        return course ? course.name : `Course #${courseId}`
    }

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const copyToClipboard = () => {
        if (voucher) {
            navigator.clipboard.writeText(voucher.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const getGradient = (percent: number) => {
        if (percent >= 36) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        if (percent >= 21) return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
        return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
    }

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '480px',
                    borderRadius: '32px',
                    padding: '0',
                    overflow: 'hidden',
                    background: 'white',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Header Section */}
                <div style={{
                    background: voucher.used ? '#f1f5f9' : getGradient(voucher.percent),
                    padding: '40px 32px',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: voucher.used ? '#64748b' : 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}
                    >
                        ×
                    </button>

                    <div style={{
                        fontSize: '64px',
                        fontWeight: '900',
                        color: voucher.used ? '#94a3b8' : 'white',
                        textShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        lineHeight: 1,
                        marginBottom: '8px'
                    }}>
                        {voucher.percent}%
                    </div>
                    <div style={{
                        color: voucher.used ? '#64748b' : 'rgba(255,255,255,0.9)',
                        fontWeight: '700',
                        fontSize: '18px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Discount Voucher
                    </div>
                </div>

                <div style={{ padding: '32px' }}>
                    {/* Status Section */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '99px',
                            background: voucher.used ? '#fee2e2' : '#ecfdf5',
                            color: voucher.used ? '#dc2626' : '#059669',
                            fontSize: '12px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                            {voucher.used ? 'VOUCHER USED' : 'READY TO REDEEM'}
                        </div>
                    </div>

                    {/* Code Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Voucher Code
                        </label>
                        <div style={{
                            background: '#f8fafc',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <code style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em' }}>
                                {voucher.code}
                            </code>
                            {!voucher.used && (
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        background: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {copied ? 'COPIED!' : 'COPY'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Usage Info Section */}
                    <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                            {voucher.used ? 'Redemption Details' : 'How to use'}
                        </label>

                        {voucher.used ? (
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>COURSE APPLIED</div>
                                    <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '15px' }}>{getCourseName(voucher.usedCourseId)}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>USED ON</div>
                                    <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '14px' }}>{formatDate(voucher.usedAt)}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                                <p style={{ margin: '0 0 12px' }}>
                                    • Select any course from the "Available Courses" section.
                                </p>
                                <p style={{ margin: '0 0 12px' }}>
                                    • During enrollment, apply this voucher to get <strong>{voucher.percent}% off</strong>.
                                </p>
                                <p style={{ margin: 0 }}>
                                    • The discount will be applied automatically to your total balance.
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            marginTop: '32px',
                            padding: '16px',
                            background: '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    )
}
