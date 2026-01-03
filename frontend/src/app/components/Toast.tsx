'use client'

type Props = {
  show: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  tempPassword?: string
  onClose: () => void
}

export default function Toast(props: Props) {
  if (!props.show) return null

  return (
    <div className={`notification notification-${props.type}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {props.type === 'success' && '✅'}
          {props.type === 'error' && '❌'}
          {props.type === 'info' && 'ℹ️'}
          {props.type === 'warning' && '⚠️'}
        </div>
        <div className="notification-text">
          <div className="notification-title">{props.title}</div>
          <div className="notification-message">{props.message}</div>
          {props.tempPassword && (
            <div className="notification-password">
              <strong>🔑 Temporary Password:</strong>
              <code
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#667eea',
                }}
              >
                {props.tempPassword}
              </code>
            </div>
          )}
        </div>
        <button className="notification-close" onClick={props.onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

