'use client'

import { useMemo, useState } from 'react'
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
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatus, setCourseStatus] = useState<'all' | 'available' | 'enrolled'>('all')

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase()

    return props.courses.filter((c) => {
      const enrolled = myEnrollments.some((e) => e.courseId === c.id)

      if (courseStatus === 'enrolled' && !enrolled) return false
      if (courseStatus === 'available' && enrolled) return false

      if (!q) return true
      return [c.name, c.description, c.instructor, c.duration, String(c.id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [props.courses, myEnrollments, courseSearch, courseStatus])

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
            <div className="courses-header">
              <div>
                <div className="courses-header__eyebrow">Catalog</div>
                <h2 className="courses-header__title">Available Courses</h2>
                <div className="courses-header__subtitle">Browse courses and enroll with an optional voucher.</div>
              </div>

              <div className="courses-tools">
                <div className="courses-search">
                  <span className="courses-search__icon">⌕</span>
                  <input
                    className="courses-search__input"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses (name, instructor, duration, id…)"
                  />
                </div>

                <div className="courses-filter">
                  <button type="button" className={`courses-filter__btn ${courseStatus === 'all' ? 'active' : ''}`} onClick={() => setCourseStatus('all')}>All</button>
                  <button type="button" className={`courses-filter__btn ${courseStatus === 'available' ? 'active' : ''}`} onClick={() => setCourseStatus('available')}>Available</button>
                  <button type="button" className={`courses-filter__btn ${courseStatus === 'enrolled' ? 'active' : ''}`} onClick={() => setCourseStatus('enrolled')}>Enrolled</button>
                </div>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="admin-panel" style={{ padding: 18 }}>
                <div style={{ color: 'rgba(107, 114, 128, 0.95)', fontWeight: 700 }}>No courses found.</div>
              </div>
            ) : null}

            <div className="courses-grid">
              {filteredCourses.map((course) => {
                const isEnrolled = myEnrollments.some((e) => e.courseId === course.id)

                return (
                  <div
                    key={course.id}
                    className={`course-tile ${isEnrolled ? 'course-tile--enrolled' : ''}`}
                  >
                    <div className="course-tile__top">
                      <div className="course-tile__title">{course.name}</div>
                      <div className="course-tile__price">
                        <span className="course-tile__price-value">${Number(course.price).toFixed(2)}</span>
                        <span className="course-tile__price-unit">USD</span>
                      </div>
                    </div>

                    {course.description ? (
                      <div className="course-tile__desc">{course.description}</div>
                    ) : (
                      <div className="course-tile__desc course-tile__desc--muted">No description provided.</div>
                    )}

                    <div className="course-tile__meta">
                      {course.instructor ? <span className="chip chip-muted">👨‍🏫 {course.instructor}</span> : null}
                      {course.duration ? <span className="chip chip-primary">⏱ {course.duration}</span> : null}
                      {isEnrolled ? <span className="chip chip-primary">✅ Enrolled</span> : <span className="chip chip-muted">🆕 Available</span>}
                    </div>

                    {!isEnrolled ? (
                      <div className="course-tile__voucher">
                        <VoucherSelect vouchers={props.vouchers} value={props.selectedVoucherCode} onChange={props.onSelectVoucher} />
                      </div>
                    ) : (
                      <div className="course-tile__enrolled-note">You are already enrolled in this course.</div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEnrolled) props.onBuyCourse(course.id)
                      }}
                      disabled={isEnrolled}
                      className={`course-tile__cta btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {isEnrolled ? '✅ ENROLLED' : 'ENROLL NOW'}
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

