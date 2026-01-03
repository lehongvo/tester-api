'use client'

import type { Account, Course, Enrollment, Transaction, User, Voucher } from '../../types'
import VoucherSelect from '../VoucherSelect'

export default function StudentDashboardLegacy(props: {
  user: User
  loading: boolean
  error: string
  account: Account | null
  courses: Course[]
  enrollments: Enrollment[]
  transactions: Transaction[]
  vouchers: Voucher[]
  selectedVoucherCode: string
  onSelectVoucher: (code: string) => void
  activeTab: 'dashboard' | 'courses' | 'enrollments' | 'history'
  onTab: (t: 'dashboard' | 'courses' | 'enrollments' | 'history') => void
  onLogout: () => void
  onOpenUserInfo: () => void
  onBuyCourse: (courseId: number) => void
}) {
  const myEnrollments = props.enrollments

  return (
    <div>
      <div className="header header--hero">
        <div className="header-content header-content--hero">
          <div className="hero-left">
            <div className="hero-badge">E-Learning • Student Portal</div>
            <h1 className="hero-title">Student Dashboard</h1>
            <p className="hero-subtitle">Learn smarter. Track your balance, enrollments, and course progress in one place.</p>
          </div>

          <div className="header-actions header-actions--hero">
            <button type="button" className="hero-user hero-user--clickable" onClick={props.onOpenUserInfo}>
              <div className="hero-user__avatar" aria-hidden="true">{String(props.user?.username || 'U').charAt(0).toUpperCase()}</div>
              <div className="hero-user__meta">
                <div className="hero-user__label">Signed in as</div>
                <div className="hero-user__name">{props.user?.username}</div>
              </div>
            </button>
            <button onClick={props.onLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        {props.error && <div className="error">{props.error}</div>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <button onClick={() => props.onTab('dashboard')} className={`tab-button ${props.activeTab === 'dashboard' ? 'active' : ''}`}>📊 Dashboard</button>
          <button onClick={() => props.onTab('courses')} className={`tab-button ${props.activeTab === 'courses' ? 'active' : ''}`}>📚 Courses</button>
          <button onClick={() => props.onTab('enrollments')} className={`tab-button ${props.activeTab === 'enrollments' ? 'active' : ''}`}>🎓 Enrollments</button>
          <button onClick={() => props.onTab('history')} className={`tab-button ${props.activeTab === 'history' ? 'active' : ''}`}>📜 History</button>
        </div>

        {props.activeTab === 'courses' && (
          <div>
            <h2>Available Courses</h2>
            <div className="courses-grid">
              {props.courses.map((course) => {
                const isEnrolled = myEnrollments.some((e) => e.courseId === course.id)

                return (
                  <div key={course.id} className="course-card" style={{ cursor: 'pointer' }}>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                    <div className="price">${course.price}</div>

                    {!isEnrolled && (
                      <VoucherSelect vouchers={props.vouchers} value={props.selectedVoucherCode} onChange={props.onSelectVoucher} />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEnrolled) props.onBuyCourse(course.id)
                      }}
                      disabled={isEnrolled}
                      className={`btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ marginTop: 10, width: '100%', opacity: isEnrolled ? 0.7 : 1, cursor: isEnrolled ? 'default' : 'pointer' }}
                    >
                      {isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Keep other legacy tabs as-is for now; will be extracted next */}
        {props.activeTab !== 'courses' && (
          <div className="card" style={{ padding: 24 }}>
            <h3>Legacy view</h3>
            <p>Other student tabs will be extracted next step.</p>
          </div>
        )}
      </div>
    </div>
  )
}

