import React from 'react'

interface NotificationToastProps {
    notification: {
        show: boolean
        type: 'success' | 'error' | 'info' | 'warning'
        title: string
        message: string
        tempPassword?: string
    }
    onClose: () => void
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    if (!notification.show) return null

    return (
        <div className={`notification notification-${notification.type}`}>
            <div className="notification-content">
                <div className="notification-icon">
                    {notification.type === 'success' && '✅'}
                    {notification.type === 'error' && '❌'}
                    {notification.type === 'info' && 'ℹ️'}
                    {notification.type === 'warning' && '⚠️'}
                </div>
                <div className="notification-text">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    {notification.tempPassword && (
                        <div className="notification-password">
                            <strong>🔑 Temporary Password:</strong>
                            <code style={{
                                background: 'rgba(0,0,0,0.1)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                marginLeft: '8px',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#4f46e5'
                            }}>
                                {notification.tempPassword}
                            </code>
                        </div>
                    )}
                </div>
                <button
                    className="notification-close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
        </div>
    )
}
