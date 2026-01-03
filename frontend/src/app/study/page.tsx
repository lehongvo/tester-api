'use client'

import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'

// Auto-detect API URL based on current host
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return `http://${host}:3001`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

const API_URL = getApiUrl()

type Course = {
  id: number
  name: string
  price: number
  description?: string
  instructor?: string
  duration?: string
}

type Enrollment = {
  id: number
  userId: number
  courseId: number
  paymentStatus: 'paid' | 'pending' | 'failed'
  enrolledAt: string
}

export default function StudyPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  const courseId = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('courseId')
    if (!raw) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        if (!courseId) {
          setError('Missing courseId in URL. Example: /study?courseId=15')
          return
        }

        const [courseRes, enrollRes] = await Promise.all([
          axios.get(`${API_URL}/courses/${courseId}`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/enrollments`, { headers: getAuthHeaders() }),
        ])

        setCourse(courseRes.data)
        setEnrollments(enrollRes.data)

        const isEnrolled = (enrollRes.data || []).some((e: any) => e.courseId === courseId)
        if (!isEnrolled) {
          setError('You are not enrolled in this course (403). Please purchase/enroll first.')
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load study page')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [courseId])

  const lessons = useMemo(() => {
    if (!course) return []
    // mock lessons
    return [
      { id: 1, title: 'Welcome & Course Overview', duration: '5 min' },
      { id: 2, title: 'Key Concepts', duration: '12 min' },
      { id: 3, title: 'Hands-on Practice', duration: '25 min' },
      { id: 4, title: 'Quiz & Wrap-up', duration: '10 min' },
    ]
  }, [course])

  if (loading) {
    return (
      <div className="container">
        <div className="loading" />
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ marginBottom: 6 }}>🎓 Study</h1>
        <div style={{ color: '#6b7280', fontWeight: 600 }}>
          {course ? course.name : 'Course'}
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}

      {course && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginTop: 18 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 10 }}>About this course</h2>
            <div style={{ color: '#374151', lineHeight: 1.7 }}>
              {course.description || 'No description'}
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {course.instructor && <span className="chip chip-muted">👨‍🏫 {course.instructor}</span>}
              {course.duration && <span className="chip chip-muted">⏱️ {course.duration}</span>}
              <span className="chip chip-primary">Course ID: {course.id}</span>
            </div>

            <div style={{ marginTop: 22 }}>
              <h3 style={{ marginBottom: 12 }}>Lessons</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {lessons.map((l) => (
                  <div key={l.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontWeight: 800 }}>{l.title}</div>
                      <div style={{ color: '#6b7280', fontWeight: 700 }}>{l.duration}</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn btn-primary" type="button">
                        ▶️ Start lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 10 }}>Your enrollment</h3>
              <div style={{ color: '#6b7280' }}>
                Status:{' '}
                <strong>
                  {enrollments.find((e) => e.courseId === course.id)?.paymentStatus || '—'}
                </strong>
              </div>
              <div style={{ marginTop: 10, color: '#6b7280' }}>
                Enrolled at:{' '}
                <strong>
                  {(() => {
                    const e = enrollments.find((x) => x.courseId === course.id)
                    return e ? new Date(e.enrolledAt).toLocaleString() : '—'
                  })()}
                </strong>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 10 }}>Progress</h3>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(107,114,128,0.15)', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
              </div>
              <div style={{ marginTop: 10, color: '#6b7280', fontWeight: 700 }}>10% completed (mock)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

