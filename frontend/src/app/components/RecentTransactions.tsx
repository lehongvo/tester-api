'use client'

import { useMemo } from 'react'

type Transaction = {
  id: number
  fromUserId?: number
  toUserId?: number
  amount: number
  type: 'transfer' | 'payment' | 'adjustment'
  description?: string
  createdAt: string
}

type Props = {
  loading: boolean
  items: Transaction[]
  onOpenAll: () => void
  onOpenDetail: (tx: Transaction) => void
}

const typeLabel: Record<Transaction['type'], string> = {
  transfer: 'Transfer',
  payment: 'Payment',
  adjustment: 'Adjustment',
}

export default function RecentTransactions(props: Props) {
  const rows = useMemo(() => props.items.slice(0, 5), [props.items])

  return (
    <div className="admin-panel" style={{ marginTop: 8 }}>
      <div className="admin-panel__header" style={{ marginBottom: 14 }}>
        <div>
          <div className="admin-panel__eyebrow">Overview</div>
          <h2 className="admin-panel__title">📜 Recent Transactions</h2>
          <div className="admin-panel__subtitle">Click a transaction to view details.</div>
        </div>

        <div className="admin-panel__tools">
          <button type="button" className="btn btn-primary" onClick={props.onOpenAll}>
            View all
          </button>
        </div>
      </div>

      {props.loading ? (
        <div className="loading" />
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 18, color: '#6b7280' }}>No transactions yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((tx) => {
            const positive = tx.type === 'adjustment' || tx.type === 'transfer' ? tx.amount >= 0 : false
            const amountColor = tx.type === 'payment' ? '#ef4444' : positive ? '#16a34a' : '#111827'
            const badgeClass =
              tx.type === 'payment'
                ? 'pill pill-danger'
                : tx.type === 'transfer'
                  ? 'pill pill-primary'
                  : 'pill pill-success'

            return (
              <button
                key={tx.id}
                type="button"
                className="tx-row"
                onClick={() => props.onOpenDetail(tx)}
                title="View transaction detail"
              >
                <div className="tx-row__left">
                  <div className={badgeClass}>{typeLabel[tx.type]}</div>
                  <div className="tx-row__meta">
                    <div className="tx-row__desc">{tx.description || '—'}</div>
                    <div className="tx-row__sub">
                      #{tx.id} • {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="tx-row__right" style={{ color: amountColor }}>
                  ${Number(tx.amount).toFixed(2)}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

