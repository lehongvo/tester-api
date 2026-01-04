import React, { useState } from 'react'
import { Voucher } from '../../types'

interface VoucherSelectorProps {
    vouchers: Voucher[]
    coursePrice: number
    selectedVoucherCode: string | null
    onSelectVoucher: (code: string | null) => void
}

export const VoucherSelector: React.FC<VoucherSelectorProps> = ({
    vouchers,
    coursePrice,
    selectedVoucherCode,
    onSelectVoucher,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const availableVouchers = vouchers.filter(v => !v.used)
    const selectedVoucher = vouchers.find(v => v.code === selectedVoucherCode)

    const calculateDiscount = (percent: number) => {
        return (coursePrice * percent) / 100
    }

    const getGradient = (percent: number) => {
        if (percent >= 36) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        if (percent >= 21) return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
        return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px'
            }}>
                🎟️ Apply Voucher (Optional)
            </label>

            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                >
                    <span>
                        {selectedVoucher
                            ? `${selectedVoucher.code} (-${selectedVoucher.percent}%)`
                            : `${availableVouchers.length} vouchers available`
                        }
                    </span>
                    <span>{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        maxHeight: '320px',
                        overflowY: 'auto',
                        zIndex: 100,
                        padding: '8px',
                    }}>
                        {/* No voucher option */}
                        <div
                            onClick={() => {
                                onSelectVoucher(null)
                                setIsOpen(false)
                            }}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: selectedVoucherCode === null ? '#f1f5f9' : 'transparent',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#64748b',
                            }}
                        >
                            ○ Don't use voucher
                        </div>

                        {availableVouchers.length === 0 ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: '13px',
                            }}>
                                No vouchers available
                            </div>
                        ) : (
                            availableVouchers.map(voucher => (
                                <div
                                    key={voucher.id}
                                    onClick={() => {
                                        onSelectVoucher(voucher.code)
                                        setIsOpen(false)
                                    }}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: getGradient(voucher.percent),
                                        cursor: 'pointer',
                                        marginBottom: '8px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {selectedVoucherCode === voucher.code && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                    <div style={{
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        marginBottom: '4px',
                                    }}>
                                        {voucher.code}
                                    </div>
                                    <div style={{
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 800,
                                        marginBottom: '4px',
                                    }}>
                                        {voucher.percent}% OFF
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    }}>
                                        Save ${calculateDiscount(voucher.percent).toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Price Summary */}
            {selectedVoucher && (
                <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#166534',
                        marginBottom: '4px',
                    }}>
                        <span>Original Price:</span>
                        <span style={{ textDecoration: 'line-through' }}>${coursePrice.toFixed(2)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#166534',
                        marginBottom: '4px',
                    }}>
                        <span>Discount ({selectedVoucher.percent}%):</span>
                        <span>-${calculateDiscount(selectedVoucher.percent).toFixed(2)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#15803d',
                        paddingTop: '8px',
                        borderTop: '1px solid #bbf7d0',
                    }}>
                        <span>Final Price:</span>
                        <span>${(coursePrice - calculateDiscount(selectedVoucher.percent)).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
