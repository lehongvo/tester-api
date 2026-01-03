'use client'

import { useMemo } from 'react'

type Course = {
  id: number
  name: string
  price: number
  description?: string
  instructor?: string
  duration?: string
}

type Props = {
  loading: boolean
  courses: Course[]
  filter: string
  onFilterChange: (v: string) => void
  onEdit: (c: Course) => void
}

export default function AdminCourses(props: Props) {
  const filtered = useMemo(() => {
    const q = props.filter.trim().toLowerCase()
    if (!q) return props.courses
    return props.courses.filter((c) =>
      [c.name, c.description, c.instructor, c.duration, String(c.id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [props.courses, props.filter])

  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <div className="admin-panel__eyebrow">Catalog</div>
          <h2 className="admin-panel__title">📚 Courses</h2>
          <div className="admin-panel__subtitle">Click a course row to edit details.</div>
        </div>

        <div className="admin-panel__tools">
          <div className="search">
            <span className="search__icon" aria-hidden="true">⌕</span>
            <input
              value={props.filter}
              onChange={(e) => props.onFilterChange(e.target.value)}
              placeholder="Search courses (name, instructor, id…)"
              className="search__input"
            />
          </div>
        </div>
      </div>

      <div className="admin-table">
        {props.loading ? (
          <div className="loading" />
        ) : (
          <table className="table table--modern">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>Course</th>
                <th style={{ width: 160 }}>Price</th>
                <th style={{ width: 240 }}>Instructor</th>
                <th style={{ width: 170 }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>
                    No courses found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="row--clickable" onClick={() => props.onEdit(c)}>
                    <td>
                      <span className="pill pill-muted">#{c.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 800, color: '#111827' }}>{c.name}</div>
                        {c.description ? (
                          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.4 }}>
                            {c.description}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontWeight: 900, color: '#111827' }}>${Number(c.price).toFixed(2)}</span>
                        <span className="pill pill-success">USD</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{c.instructor || '—'}</span>
                    </td>
                    <td>
                      <span className="pill pill-primary">{c.duration || '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
