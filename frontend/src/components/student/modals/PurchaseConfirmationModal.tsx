import React, { useState } from 'react'
import { Course, Voucher } from '../../../types'
import { VoucherSelector } from '../VoucherSelector'

interface PurchaseConfirmationModalProps {
    show: boolean
    onClose: () => void
    course: Course | null
    vouchers: Voucher[]
    onConfirm: (courseId: number, voucherCode: string | null) => Promise<void>
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
    show,
    onClose,
    course,
    vouchers,
    onConfirm,
}) => {
    const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!show || !course) return null

    const calculateFinalPrice = () => {
        const basePrice = Number(course.price)
        if (!selectedVoucherCode) return basePrice
        const voucher = vouchers.find(v => v.code === selectedVoucherCode)
        if (!voucher) return basePrice
        return basePrice * (1 - voucher.percent / 100)
    }

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            await onConfirm(course.id, selectedVoucherCode)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '500px',
                    borderRadius: '28px',
                    padding: '32px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        margin: '0 auto 16px',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        🛍️
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>Confirm Purchase</h2>
                    <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
                        Are you sure you want to enroll in this course?
                    </p>
                </div>

                <div style={{
                    background: '#f8fafc',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Course</span>
                        <span style={{ color: '#1e293b', fontWeight: '700' }}>{course.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Base Price</span>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>${Number(course.price).toFixed(2)}</span>
                    </div>
                </div>

                <VoucherSelector
                    vouchers={vouchers}
                    coursePrice={Number(course.price)}
                    selectedVoucherCode={selectedVoucherCode}
                    onSelectVoucher={setSelectedVoucherCode}
                />

                <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '16px' }}>Total Amount</span>
                        <span style={{ color: '#4f46e5', fontWeight: '900', fontSize: '24px' }}>
                            ${calculateFinalPrice().toFixed(2)}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{
                            flex: 1,
                            background: '#f1f5f9',
                            color: '#64748b',
                            fontWeight: '700',
                            padding: '14px',
                            borderRadius: '14px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="btn btn-primary"
                        style={{
                            flex: 2,
                            padding: '14px',
                            borderRadius: '14px',
                            fontWeight: '700',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {isSubmitting ? 'PROCESSING...' : 'CONFIRM & PAY'}
                    </button>
                </div>
            </div>
        </div>
    )
}
