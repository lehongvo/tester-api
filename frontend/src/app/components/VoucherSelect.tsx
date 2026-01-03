'use client'

import { useMemo } from 'react'

type Voucher = {
  id: number
  code: string
  userId: number
  percent: number
  used: boolean
  usedAt?: string
  usedCourseId?: number
  createdAt: string
}

type Props = {
  vouchers: Voucher[]
  value: string
  onChange: (code: string) => void
}

export default function VoucherSelect(props: Props) {
  const available = useMemo(() => props.vouchers.filter((v) => !v.used), [props.vouchers])
  const used = useMemo(() => props.vouchers.filter((v) => v.used), [props.vouchers])

  return (
    <div className="voucher-select">
      <label className="voucher-select__label">Apply voucher (optional)</label>
      <select
        className="voucher-select__dropdown"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="">— No voucher —</option>
        {available.map((v) => (
          <option key={v.id} value={v.code}>
            {v.code} • -{v.percent}%
          </option>
        ))}
        {used.length > 0 && (
          <optgroup label="Used vouchers">
            {used.map((v) => (
              <option key={v.id} value={v.code} disabled>
                {v.code} • -{v.percent}% (used)
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <div className="voucher-select__hint">
        {available.length > 0
          ? `${available.length} voucher(s) available`
          : 'No available vouchers'}
      </div>
    </div>
  )
}

