'use client'

type Props = {
  show: boolean
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmModal(props: Props) {
  if (!props.show) return null

  return (
    <div className="modal" onClick={props.onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2>{props.title}</h2>
          <button className="close-btn" onClick={props.onCancel}>
            ×
          </button>
        </div>
        <div style={{ padding: '20px 0', fontSize: '16px', color: '#666', lineHeight: '1.6' }}>{props.message}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={props.onCancel} className="btn" style={{ background: '#f0f0f0', color: '#333' }}>
            Cancel
          </button>
          <button type="button" onClick={props.onConfirm} className="btn btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

