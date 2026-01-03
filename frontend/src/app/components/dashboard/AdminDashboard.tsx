'use client'

import { useMemo, useRef, useState } from 'react'
import type { Course, Student, Transaction, User } from '../../types'
import AdminCourses from '../AdminCourses'

export default function AdminDashboard(props: {
  user: User
  loading: boolean
  error: string
  students: Student[]
  courses: Course[]
  transactions: Transaction[]
  onLogout: () => void
  onOpenUserInfo: () => void
  // Students
  onCreateStudent: () => void
  onSetBalance: (userId: number) => void
  // Courses
  onCreateCourse: () => void
  onEditCourse: (c: Course) => void
  // Transactions
  onTxDetail: (tx: Transaction) => void
}) {
  const [adminTab, setAdminTab] = useState<'students' | 'courses' | 'transactions'>('students')
  const [studentFilter, setStudentFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('')

  const studentsSectionRef = useRef<HTMLDivElement | null>(null)
  const coursesSectionRef = useRef<HTMLDivElement | null>(null)
  const transactionsSectionRef = useRef<HTMLDivElement | null>(null)

  const scrollTo = (tab: typeof adminTab) => {
    setAdminTab(tab)
    const ref = tab === 'students' ? studentsSectionRef : tab === 'courses' ? coursesSectionRef : transactionsSectionRef
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const filteredStudents = useMemo(() => {
    const q = studentFilter.trim().toLowerCase()
    if (!q) return props.students
    return props.students.filter((s) =>
      [s.name, s.email, String(s.id), String(s.userId || '')]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [props.students, studentFilter])

  const filteredTransactions = useMemo(() => {
    const q = transactionFilter.trim().toLowerCase()
    if (!q) return props.transactions
    return props.transactions.filter((t) =>
      [t.type, t.description, String(t.id), String(t.fromUserId || ''), String(t.toUserId || ''), String(t.amount)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [props.transactions, transactionFilter])

  return (
    <div>
      <div className="header header--hero header--admin">
        <div className="header-content header-content--hero header-content--admin">
          <div className="hero-left">
            <div className="hero-badge">Admin • Control Center</div>
            <h1 className="hero-title hero-title--admin">Admin Dashboard</h1>
            <p className="hero-subtitle">Manage students, courses, vouchers, enrollments, and monitor transactions.</p>
          </div>

          <div className="header-actions header-actions--hero header-actions--admin">
            <button type="button" className="hero-user hero-user--clickable" onClick={props.onOpenUserInfo}>
              <div className="hero-user__avatar hero-user__avatar--admin" aria-hidden="true">
                {String(props.user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hero-user__meta">
                <div className="hero-user__label">Signed in as</div>
                <div className="hero-user__name">{props.user?.username}</div>
              </div>
            </button>

            <div className="admin-actions">
              <button onClick={props.onCreateStudent} className="btn btn-success">
                Create Student
              </button>
              <button onClick={props.onCreateCourse} className="btn btn-success">
                Create Course
              </button>
              <button onClick={props.onLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {props.error && <div className="error">{props.error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 26 }}>
          <button type="button" className="stat-card primary stat-card--clickable" onClick={() => scrollTo('students')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👥</div>
              <div style={{ fontSize: 14, color: '#999', fontWeight: 500 }}>Students</div>
            </div>
            <p className="stat-number">{props.students.length}</p>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Active accounts</div>
          </button>

          <button type="button" className="stat-card success stat-card--clickable" onClick={() => scrollTo('courses')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📚</div>
              <div style={{ fontSize: 14, color: '#999', fontWeight: 500 }}>Courses</div>
            </div>
            <p className="stat-number">{props.courses.length}</p>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Available courses</div>
          </button>

          <button type="button" className="stat-card warning stat-card--clickable" onClick={() => scrollTo('transactions')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.2) 0%, rgba(254, 225, 64, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💳</div>
              <div style={{ fontSize: 14, color: '#999', fontWeight: 500 }}>Transactions</div>
            </div>
            <p className="stat-number">{props.transactions.length}</p>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>All time</div>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => scrollTo('students')} className={`tab-button ${adminTab === 'students' ? 'active' : ''}`}>👥 Students</button>
          <button type="button" onClick={() => scrollTo('courses')} className={`tab-button ${adminTab === 'courses' ? 'active' : ''}`}>📚 Courses</button>
          <button type="button" onClick={() => scrollTo('transactions')} className={`tab-button ${adminTab === 'transactions' ? 'active' : ''}`}>💳 Transactions</button>
        </div>

        {adminTab === 'students' && (
          <div ref={studentsSectionRef} className="admin-panel" style={{ marginBottom: 30 }}>
            <div className="admin-panel__header">
              <div>
                <div className="admin-panel__eyebrow">Directory</div>
                <h2 className="admin-panel__title">👥 Students</h2>
                <div className="admin-panel__subtitle">Click a row to set balance.</div>
              </div>
              <div className="admin-panel__tools">
                <div className="search">
                  <span className="search__icon">⌕</span>
                  <input value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} placeholder="Search students (name/email/id...)" className="search__input" />
                </div>
              </div>
            </div>

            {props.loading ? (
              <div className="loading" />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table--modern">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Address</th>
                      <th>Balance (USD)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="row--clickable" onClick={() => props.onSetBalance(s.userId || s.id)}>
                          <td>{s.id}</td>
                          <td style={{ fontWeight: 800 }}>{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.age || '-'}</td>
                          <td>{s.address || '-'}</td>
                          <td style={{ fontWeight: 900, color: '#15803d' }}>${Number(s.balance || 0).toFixed(2)}</td>
                          <td>
                            <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); props.onSetBalance(s.userId || s.id) }}>
                              Set Balance
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {adminTab === 'courses' && (
          <div ref={coursesSectionRef} style={{ marginBottom: 30 }}>
            <AdminCourses
              loading={props.loading}
              courses={props.courses}
              filter={courseFilter}
              onFilterChange={setCourseFilter}
              onEdit={props.onEditCourse}
            />
          </div>
        )}

        {adminTab === 'transactions' && (
          <div ref={transactionsSectionRef} className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <div className="admin-panel__eyebrow">Audit</div>
                <h2 className="admin-panel__title">💳 Transactions</h2>
                <div className="admin-panel__subtitle">Click a row to view detail.</div>
              </div>
              <div className="admin-panel__tools">
                <div className="search">
                  <span className="search__icon">⌕</span>
                  <input value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)} placeholder="Search transactions (type/amount/user/id...)" className="search__input" />
                </div>
              </div>
            </div>

            {props.loading ? (
              <div className="loading" />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table--modern">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="row--clickable" onClick={() => props.onTxDetail(tx)}>
                          <td>{tx.id}</td>
                          <td style={{ fontWeight: 800 }}>{tx.type}</td>
                          <td>{tx.fromUserId || '-'}</td>
                          <td>{tx.toUserId || '-'}</td>
                          <td style={{ fontWeight: 900 }}>${Number(tx.amount).toFixed(2)}</td>
                          <td>{tx.description || '-'}</td>
                          <td>{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

