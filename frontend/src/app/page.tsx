'use client'

import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import RecentTransactions from './components/RecentTransactions'

// Auto-detect API URL based on current host
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return `http://${host}:3001`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

const API_URL = getApiUrl()

interface User {
  id: number
  username: string
  role: 'admin' | 'student'
}

interface Student {
  id: number
  name: string
  email: string
  age?: number
  address?: string
  balance?: number
  userId?: number
}

interface Account {
  balance: number
  currency: string
}

interface Course {
  id: number
  name: string
  price: number
  description?: string
  instructor?: string
  duration?: string
}

interface Transaction {
  id: number
  fromUserId?: number
  toUserId?: number
  amount: number
  type: 'transfer' | 'payment' | 'adjustment'
  description?: string
  createdAt: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Admin states
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [adminTab, setAdminTab] = useState<'students' | 'courses' | 'transactions'>('students')
  const [studentFilter, setStudentFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('')

  const studentsSectionRef = useRef<HTMLDivElement | null>(null)
  const coursesSectionRef = useRef<HTMLDivElement | null>(null)
  const transactionsSectionRef = useRef<HTMLDivElement | null>(null)

  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false)
  const [showSetBalanceModal, setShowSetBalanceModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false)
  const [showEditCourseModal, setShowEditCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editCourseForm, setEditCourseForm] = useState({
    name: '',
    price: '',
    description: '',
    instructor: '',
    duration: '',
  })
  
  // Student states
  const [account, setAccount] = useState<Account | null>(null)
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([])
  interface Enrollment {
    id: number
    userId: number
    courseId: number
    paymentStatus: 'paid' | 'pending' | 'failed'
    enrolledAt: string
  }

  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollmentCourseId, setSelectedEnrollmentCourseId] = useState<number | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showBuyCourseModal, setShowBuyCourseModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'enrollments' | 'history'>('dashboard')
  const [balanceVisible, setBalanceVisible] = useState(true)
  
  // Form states
  const [createStudentForm, setCreateStudentForm] = useState({
    username: '',
    email: '',
    fullName: '',
    studentId: '',
    password: '',
    age: '',
    address: '',
  })
  const [setBalanceForm, setSetBalanceForm] = useState({
    balance: '',
    description: '',
  })
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    amount: '',
    description: '',
  })
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [createCourseForm, setCreateCourseForm] = useState({
    name: '',
    price: '',
    description: '',
    instructor: '',
    duration: '',
  })
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
    tempPassword?: string
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  })

  const [showUserInfo, setShowUserInfo] = useState(false)
  const [userInfoLoading, setUserInfoLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ email: '', fullName: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  const openUserInfo = async () => {
    setShowUserInfo(true)
    setUserInfoLoading(true)
    try {
      const res = await axios.get(`${API_URL}/auth/me`, { headers: getAuthHeaders() })
      setUserInfo(res.data)
      setProfileForm({ email: res.data?.email || '', fullName: res.data?.fullName || '' })
    } catch (e) {
      setUserInfo(null)
    } finally {
      setUserInfoLoading(false)
    }
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const res = await axios.patch(
        `${API_URL}/auth/me`,
        {
          email: profileForm.email || null,
          fullName: profileForm.fullName || null,
        },
        { headers: getAuthHeaders() },
      )
      setUserInfo({ ...userInfo, ...res.data })
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Profile updated',
        message: 'Your profile information has been updated successfully.',
      })
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 4000)
      setIsEditingProfile(false)
    } catch (err: any) {
      setNotification({
        show: true,
        type: 'error',
        title: '❌ Update failed',
        message: err.response?.data?.message || err.message || 'Failed to update profile',
      })
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 5000)
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await axios.patch(
        `${API_URL}/auth/me/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: getAuthHeaders() },
      )
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Password updated',
        message: 'Your password has been updated successfully. Please use the new password next login.',
      })
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 5000)
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err: any) {
      setNotification({
        show: true,
        type: 'error',
        title: '❌ Password update failed',
        message: err.response?.data?.message || err.message || 'Failed to update password',
      })
      setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 6000)
    } finally {
      setProfileSaving(false)
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      // Refresh user data from backend to ensure role is correct
      axios.get(`${API_URL}/auth/me`, { headers: getAuthHeaders() })
        .then((response) => {
          const userData = response.data
          console.log('Refreshed user from backend:', userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
          setIsAuthenticated(true)
          if (userData.role === 'admin') {
            fetchAdminData()
          } else {
            fetchStudentData()
          }
        })
        .catch((err) => {
          // If refresh fails, try using localStorage data
          try {
            const userData = JSON.parse(userStr)
            console.log('Using localStorage user data:', userData)
            setUser(userData)
      setIsAuthenticated(true)
            if (userData.role === 'admin') {
              fetchAdminData()
            } else {
              fetchStudentData()
            }
          } catch (e) {
            console.error('Error parsing user data:', e)
            logout()
          }
        })
    }
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      console.log('Login response user:', response.data.user)
      setUser(response.data.user)
      setIsAuthenticated(true)
      
      if (response.data.user.role === 'admin') {
        fetchAdminData()
      } else {
        fetchStudentData()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setStudents([])
    setCourses([])
    setTransactions([])
    setAccount(null)
    setMyTransactions([])
  }

  // Admin functions
  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [studentsWithBalancesRes, coursesRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/students/with-balances`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/courses`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/admin/transactions`, { headers: getAuthHeaders() }),
      ])
      // Map students with balances to students array for display
      const studentsData = studentsWithBalancesRes.data.map((item: any) => ({
        id: item.student?.id || item.user.id,
        name: item.student?.name || item.user.fullName,
        email: item.user.email,
        age: item.student?.age,
        address: item.student?.address,
        balance: item.account.balance,
        userId: item.user.id,
      }))
      setStudents(studentsData)
      setCourses(coursesRes.data)
      setTransactions(transactionsRes.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
      }
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const scrollToAdminSection = (tab: 'students' | 'courses' | 'transactions') => {
    setAdminTab(tab)
    const ref =
      tab === 'students'
        ? studentsSectionRef
        : tab === 'courses'
          ? coursesSectionRef
          : transactionsSectionRef

    // Wait for tab content to render before scroll
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const filteredStudents = useMemo(() => {
    const q = studentFilter.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) =>
      [s.name, s.email, String(s.id), String(s.userId || '')]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [students, studentFilter])

  const filteredCourses = useMemo(() => {
    const q = courseFilter.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) =>
      [c.name, c.description, c.instructor, c.duration, String(c.id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [courses, courseFilter])

  const filteredTransactions = useMemo(() => {
    const q = transactionFilter.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter((t) =>
      [t.type, t.description, String(t.id), String(t.fromUserId || ''), String(t.toUserId || ''), String(t.amount)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [transactions, transactionFilter])

  const createStudentUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload: any = {
        username: createStudentForm.username,
        email: createStudentForm.email,
        fullName: createStudentForm.fullName,
        age: createStudentForm.age ? parseInt(createStudentForm.age) : undefined,
        address: createStudentForm.address || undefined,
      }
      
      // Only include studentId if provided (optional, will be auto-generated)
      if (createStudentForm.studentId) {
        payload.studentId = createStudentForm.studentId
      }
      
      // Only include password if provided (optional, will be auto-generated)
      if (createStudentForm.password) {
        payload.password = createStudentForm.password
      }
      
      const response = await axios.post(
        `${API_URL}/admin/students`,
        payload,
        { headers: getAuthHeaders() }
      )
      setShowCreateStudentModal(false)
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Student Created Successfully!',
        message: 'Student account has been created with initial balance of 10,000 USD.',
        tempPassword: response.data.tempPassword,
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 8000)
      setCreateStudentForm({
        username: '',
        email: '',
        fullName: '',
        studentId: '', // Will be auto-generated
        password: '',
        age: '',
        address: '',
      })
      fetchAdminData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student')
    }
  }

  const setStudentBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await axios.put(
        `${API_URL}/admin/students/${selectedStudentId}/balance`,
        {
          balance: parseFloat(setBalanceForm.balance),
          description: setBalanceForm.description,
        },
        { headers: getAuthHeaders() }
      )
      setShowSetBalanceModal(false)
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Balance Updated!',
        message: `Student balance has been updated to $${setBalanceForm.balance}.`,
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
      setSetBalanceForm({ balance: '', description: '' })
      setSelectedStudentId(null)
      fetchAdminData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set balance')
    }
  }

  const openEditCourse = (course: Course) => {
    setEditingCourse(course)
    setEditCourseForm({
      name: course.name || '',
      price: String(course.price ?? ''),
      description: course.description || '',
      instructor: course.instructor || '',
      duration: course.duration || '',
    })
    setShowEditCourseModal(true)
  }

  const saveCourseEdits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return
    setError('')
    try {
      await axios.patch(
        `${API_URL}/courses/${editingCourse.id}`,
        {
          name: editCourseForm.name,
          price: parseFloat(editCourseForm.price),
          description: editCourseForm.description || undefined,
          instructor: editCourseForm.instructor || undefined,
          duration: editCourseForm.duration || undefined,
        },
        { headers: getAuthHeaders() },
      )
      setShowEditCourseModal(false)
      setEditingCourse(null)
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Course Updated',
        message: 'Course information has been updated successfully.',
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
      fetchAdminData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course')
    }
  }

  const deleteCourse = async () => {
    if (!editingCourse) return
    setError('')
    try {
      await axios.delete(`${API_URL}/courses/${editingCourse.id}`, { headers: getAuthHeaders() })
      setShowEditCourseModal(false)
      setEditingCourse(null)
      setNotification({
        show: true,
        type: 'success',
        title: '🗑️ Course Deleted',
        message: 'Course has been deleted successfully.',
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
      fetchAdminData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete course')
    }
  }

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(
        `${API_URL}/courses`,
        {
          ...createCourseForm,
          price: parseFloat(createCourseForm.price),
        },
        { headers: getAuthHeaders() }
      )
      setShowCreateCourseModal(false)
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Course Created!',
        message: `Course "${createCourseForm.name}" has been created successfully.`,
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
      setCreateCourseForm({
        name: '',
        price: '',
        description: '',
        instructor: '',
        duration: '',
      })
      fetchAdminData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course')
    }
  }

  // Student functions
  const fetchStudentData = async () => {
    setLoading(true)
    try {
      const [accountRes, transactionsRes, enrollmentsRes, coursesRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/me/account`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/transactions/history`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/enrollments`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/courses`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/transfer/students`, { headers: getAuthHeaders() }).catch(() => ({ data: [] })),
      ])
      setAccount(accountRes.data)
      setMyTransactions(transactionsRes.data)
      setMyEnrollments(enrollmentsRes.data)
      setCourses(coursesRes.data)
      setStudentsList(studentsRes.data || [])
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
      }
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const transfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(
        `${API_URL}/transactions/transfer`,
        {
          toUserId: parseInt(transferForm.toUserId),
          amount: parseFloat(transferForm.amount),
          description: transferForm.description,
        },
        { headers: getAuthHeaders() }
      )
      setShowTransferModal(false)
      setNotification({
        show: true,
        type: 'success',
        title: '✅ Transfer Successful!',
        message: `Successfully transferred $${transferForm.amount} to the recipient.`,
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
      setTransferForm({ toUserId: '', amount: '', description: '' })
      fetchStudentData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed')
    }
  }

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const buyCourse = async (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    setConfirmModal({
      show: true,
      title: '🛒 Confirm Course Purchase',
      message: `Are you sure you want to purchase "${course?.name}" for $${course?.price}?`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false })
        setError('')
        try {
          const response = await axios.post(
            `${API_URL}/courses/${courseId}/buy`,
            {},
            { headers: getAuthHeaders() }
          )
          setNotification({
            show: true,
            type: 'success',
            title: '✅ Course Purchased!',
            message: `Successfully enrolled in "${course?.name}". Your remaining balance is $${response.data.remainingBalance.toFixed(2)}.`,
          })
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
          fetchStudentData()
        } catch (err: any) {
          setNotification({
            show: true,
            type: 'error',
            title: '❌ Purchase Failed',
            message: err.response?.data?.message || 'Failed to purchase course',
          })
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
        }
      },
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>School Banking System</h1>
          <form onSubmit={login}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
              Default: admin / admin123
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Debug: Log user info
  console.log('Render - User:', user, 'Role:', user?.role, 'Is Admin:', user?.role === 'admin')

  // Admin Dashboard
  if (user?.role === 'admin') {
  return (
    <div>
      <div className="header header--hero header--admin">
        <div className="header-content header-content--hero header-content--admin">
          <div className="hero-left">
            <div className="hero-badge">Admin • Control Center</div>
            <h1 className="hero-title hero-title--admin">Admin Dashboard</h1>
            <p className="hero-subtitle">
              Manage students, courses, enrollments, and monitor transactions in one place.
            </p>
          </div>

          <div className="header-actions header-actions--hero header-actions--admin">
            <button type="button" className="hero-user hero-user--clickable" onClick={openUserInfo} title="View account info">
              <div className="hero-user__avatar hero-user__avatar--admin" aria-hidden="true">
                {String(user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hero-user__meta">
                <div className="hero-user__label">Signed in as</div>
                <div className="hero-user__name">{user?.username}</div>
              </div>
            </button>

            <div className="admin-actions">
              <button onClick={() => setShowCreateStudentModal(true)} className="btn btn-success">
                Create Student
              </button>
              <button onClick={() => setShowCreateCourseModal(true)} className="btn btn-success">
                Create Course
              </button>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}
        
          {/* Quick Stats Cards - Banking Style */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '26px' }}>
            <button type="button" className="stat-card primary stat-card--clickable" onClick={() => scrollToAdminSection('students')} title="Go to Students">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  👥
                </div>
                <div style={{ fontSize: '14px', color: '#999', fontWeight: '500' }}>Students</div>
              </div>
              <p className="stat-number">{students.length}</p>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Active accounts</div>
            </button>
            <button type="button" className="stat-card success stat-card--clickable" onClick={() => scrollToAdminSection('courses')} title="Go to Courses">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  📚
                </div>
                <div style={{ fontSize: '14px', color: '#999', fontWeight: '500' }}>Courses</div>
              </div>
              <p className="stat-number">{courses.length}</p>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Available courses</div>
            </button>
            <button type="button" className="stat-card warning stat-card--clickable" onClick={() => scrollToAdminSection('transactions')} title="Go to Transactions">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.2) 0%, rgba(254, 225, 64, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  💳
                </div>
                <div style={{ fontSize: '14px', color: '#999', fontWeight: '500' }}>Transactions</div>
              </div>
              <p className="stat-number">{transactions.length}</p>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>All time</div>
            </button>
          </div>

          {/* Admin section tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '26px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => scrollToAdminSection('students')}
              className={`tab-button ${adminTab === 'students' ? 'active' : ''}`}
            >
              👥 Students
            </button>
            <button
              type="button"
              onClick={() => scrollToAdminSection('courses')}
              className={`tab-button ${adminTab === 'courses' ? 'active' : ''}`}
            >
              📚 Courses
            </button>
            <button
              type="button"
              onClick={() => scrollToAdminSection('transactions')}
              className={`tab-button ${adminTab === 'transactions' ? 'active' : ''}`}
            >
              💳 Transactions
            </button>
          </div>

          {adminTab === 'students' && (
          <div ref={studentsSectionRef} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <h2 style={{ marginBottom: '0', color: '#333' }}>👥 Students</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  placeholder="Filter students (name/email/id...)"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(229, 231, 235, 0.9)',
                    minWidth: '280px',
                    background: 'rgba(255,255,255,0.9)',
                  }}
                />
              </div>
            </div>
        {loading ? (
              <div className="loading"></div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <table className="table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Address</th>
                      <th>Balance (USD)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                          No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => {
                    setSelectedStudentId(student.userId || student.id)
                    setShowSetBalanceModal(true)
                  }} style={{ cursor: 'pointer' }}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age || '-'}</td>
                    <td>{student.address || '-'}</td>
                          <td style={{ fontWeight: 'bold', color: '#28a745' }}>
                            ${student.balance?.toFixed(2) || '0.00'}
                          </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStudentId(student.userId || student.id)
                          setShowSetBalanceModal(true)
                        }}
                        className="btn btn-primary"
                      >
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
          <div ref={coursesSectionRef} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <h2 style={{ marginBottom: '0', color: '#333' }}>📚 Courses</h2>
              <input
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                placeholder="Filter courses (name/instructor/id...)"
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(229, 231, 235, 0.9)',
                  minWidth: '280px',
                  background: 'rgba(255,255,255,0.9)',
                }}
              />
            </div>

            {loading ? (
              <div className="loading"></div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <table className="table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price (USD)</th>
                      <th>Instructor</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} style={{ cursor: 'pointer' }} onClick={() => openEditCourse(course)}>
                        <td>{course.id}</td>
                        <td>{course.name}</td>
                        <td>${course.price}</td>
                        <td>{course.instructor || '-'}</td>
                        <td>{course.duration || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {adminTab === 'transactions' && (
          <div ref={transactionsSectionRef}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <h2 style={{ marginBottom: '0', color: '#333' }}>💳 All Transactions</h2>
              <input
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                placeholder="Filter transactions (type/amount/user/id...)"
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(229, 231, 235, 0.9)',
                  minWidth: '280px',
                  background: 'rgba(255,255,255,0.9)',
                }}
              />
            </div>

            {loading ? (
              <div className="loading"></div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <table className="table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
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
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} style={{ cursor: 'pointer' }} onClick={() => {
                        setNotification({
                          show: true,
                          type: 'info',
                          title: '💳 Transaction Detail',
                          message: `#${tx.id} • ${tx.type} • ${tx.amount} • From ${tx.fromUserId || '-'} → To ${tx.toUserId || '-'}${tx.description ? ` • ${tx.description}` : ''}`,
                        })
                        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000)
                      }}>
                        <td>{tx.id}</td>
                        <td>{tx.type}</td>
                        <td>{tx.fromUserId || '-'}</td>
                        <td>{tx.toUserId || '-'}</td>
                        <td>${tx.amount}</td>
                        <td>{tx.description || '-'}</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Create Student Modal */}
        {showCreateStudentModal && (
          <div className="modal" onClick={() => setShowCreateStudentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Student User</h2>
                <button className="close-btn" onClick={() => setShowCreateStudentModal(false)}>×</button>
              </div>
              <form onSubmit={createStudentUser}>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={createStudentForm.username}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={createStudentForm.email}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={createStudentForm.fullName}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password (leave empty for auto-generated)</label>
                  <input
                    type="password"
                    value={createStudentForm.password}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={createStudentForm.age}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={createStudentForm.address}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, address: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateStudentModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Balance Modal */}
        {showSetBalanceModal && (
          <div className="modal" onClick={() => setShowSetBalanceModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Set Student Balance</h2>
                <button className="close-btn" onClick={() => setShowSetBalanceModal(false)}>×</button>
              </div>
              <form onSubmit={setStudentBalance}>
                <div className="form-group">
                  <label>Balance (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={setBalanceForm.balance}
                    onChange={(e) => setSetBalanceForm({ ...setBalanceForm, balance: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={setBalanceForm.description}
                    onChange={(e) => setSetBalanceForm({ ...setBalanceForm, description: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">Update</button>
                  <button type="button" onClick={() => setShowSetBalanceModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditCourseModal && (
          <div className="modal" onClick={() => setShowEditCourseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Course</h2>
                <button className="close-btn" onClick={() => setShowEditCourseModal(false)}>×</button>
              </div>
              <form onSubmit={saveCourseEdits}>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    value={editCourseForm.name}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCourseForm.price}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editCourseForm.description}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Instructor</label>
                  <input
                    type="text"
                    value={editCourseForm.instructor}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={editCourseForm.duration}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" onClick={() => setShowEditCourseModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        show: true,
                        title: '🗑️ Delete Course',
                        message: `Are you sure you want to delete "${editingCourse?.name}"?`,
                        onConfirm: async () => {
                          setConfirmModal({ ...confirmModal, show: false })
                          await deleteCourse()
                        },
                      })
                    }}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Course Modal */}
        {showCreateCourseModal && (
          <div className="modal" onClick={() => setShowCreateCourseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Course</h2>
                <button className="close-btn" onClick={() => setShowCreateCourseModal(false)}>×</button>
              </div>
              <form onSubmit={createCourse}>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    value={createCourseForm.name}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createCourseForm.price}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={createCourseForm.description}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Instructor</label>
                  <input
                    type="text"
                    value={createCourseForm.instructor}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={createCourseForm.duration}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, duration: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateCourseModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Student Dashboard
  return (
    <div>
      <div className="header header--hero">
        <div className="header-content header-content--hero">
          <div className="hero-left">
            <div className="hero-badge">E-Learning • Student Portal</div>
            <h1 className="hero-title">Student Dashboard</h1>
            <p className="hero-subtitle">
              Learn smarter. Track your balance, enrollments, and course progress in one place.
            </p>
          </div>

          <div className="header-actions header-actions--hero">
            <button type="button" className="hero-user hero-user--clickable" onClick={openUserInfo} title="View account info">
              <div className="hero-user__avatar" aria-hidden="true">
                {String(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hero-user__meta">
                <div className="hero-user__label">Signed in as</div>
                <div className="hero-user__name">{user?.username}</div>
              </div>
            </button>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          >
            📚 Courses
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
          >
            🎓 Enrollments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          >
            📜 History
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="student-balance-card">
              <h2>💰 Account Balance</h2>
              <div className="balance-amount">
                ${account?.balance.toFixed(2) || '0.00'}
                <span className="balance-currency">{account?.currency || 'USD'}</span>
              </div>
              <p style={{ opacity: 0.9, fontSize: '14px', marginTop: '16px' }}>
                Available for transfers and course purchases
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <button 
                onClick={() => setShowTransferModal(true)} 
                className="btn btn-success" 
                style={{ padding: '24px', fontSize: '18px', justifyContent: 'center' }}
              >
                💸 Transfer Money
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('enrollments')}
                className="card card--clickable"
                style={{ padding: '20px', textAlign: 'center' }}
                title="View your enrolled courses"
              >
                <h3 style={{ marginBottom: '8px' }}>📈 Total Enrollments</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                  {myEnrollments.length}
                </p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                  Click to view
                </div>
              </button>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '8px' }}>📝 Total Transactions</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
                  {myTransactions.length}
                </p>
              </div>
            </div>

            <RecentTransactions
              loading={loading}
              items={myTransactions}
              onOpenAll={() => setActiveTab('history')}
              onOpenDetail={(tx) => {
                setNotification({
                  show: true,
                  type: 'info',
                  title: '💳 Transaction Detail',
                  message: `#${tx.id} • ${tx.type} • ${tx.amount}${tx.description ? ` • ${tx.description}` : ''}`,
                })
                setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 6000)
              }}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 style={{ marginBottom: '24px', color: '#333' }}>📚 Available Courses</h2>
            {loading ? (
              <div className="loading"></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {courses.map((course) => {
                  const isEnrolled = myEnrollments.some((e) => e.courseId === course.id)
                  const canAfford = account && account.balance >= course.price
                  return (
                    <div key={course.id} className="course-card">
                      <h3>{course.name}</h3>
                      <div className="course-price">${course.price}</div>
                      {course.description && (
                        <p className="course-description">{course.description}</p>
                      )}
                      <div style={{ marginTop: '16px' }}>
                        {course.instructor && (
                          <p className="course-info">👨‍🏫 <strong>Instructor:</strong> {course.instructor}</p>
                        )}
                        {course.duration && (
                          <p className="course-info">⏱️ <strong>Duration:</strong> {course.duration}</p>
                        )}
                      </div>
                      {isEnrolled ? (
                        <button className="btn btn-success" disabled style={{ width: '100%', marginTop: '20px', opacity: 0.7 }}>
                          ✅ Already Enrolled
                        </button>
                      ) : (
                        <button
                          onClick={() => buyCourse(course.id)}
                          className="btn btn-primary"
                          style={{ width: '100%', marginTop: '20px' }}
                          disabled={!canAfford}
                          title={!canAfford ? `Insufficient balance. Need $${course.price}, have $${account?.balance.toFixed(2) || '0.00'}` : ''}
                        >
                          {canAfford ? '🛒 Buy Course' : `💰 Need $${(course.price - (account?.balance || 0)).toFixed(2)} more`}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div>
            <h2 style={{ marginBottom: '24px', color: '#333' }}>🎓 My Enrollments</h2>

            {loading ? (
              <div className="loading"></div>
            ) : myEnrollments.length === 0 ? (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>No enrollments yet</h3>
                <p style={{ color: '#6b7280' }}>
                  Browse the Courses tab and purchase a course to start learning.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => setActiveTab('courses')}>
                    📚 Go to Courses
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {myEnrollments
                  .slice()
                  .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                  .map((enr) => {
                    const course = courses.find((c) => c.id === enr.courseId)
                    return (
                      <button
                        key={enr.id}
                        type="button"
                        className="course-card course-card--enrolled"
                        onClick={() => {
                          if (course) {
                            setSelectedEnrollmentCourseId(course.id)
                            setConfirmModal({
                              show: true,
                              title: '🎓 Start Learning',
                              message: `Open course "${course.name}"?`,
                              onConfirm: () => {
                                setConfirmModal({ ...confirmModal, show: false })
                                window.location.href = `/study?courseId=${course.id}`
                              },
                            })
                          }
                        }}
                        style={{ textAlign: 'left' }}
                        title={course ? 'Click to start learning' : 'Course details not found'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <h3 style={{ margin: 0 }}>{course?.name || `Course #${enr.courseId}`}</h3>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                            ✅ ENROLLED
                          </div>
                        </div>
                        {course?.description && (
                          <p className="course-description" style={{ marginTop: '10px' }}>
                            {course.description}
                          </p>
                        )}
                        <div style={{ marginTop: '12px', color: '#6b7280', fontSize: '13px' }}>
                          <div>📅 Enrolled: {new Date(enr.enrolledAt).toLocaleString()}</div>
                          {course?.instructor && <div>👨‍🏫 Instructor: {course.instructor}</div>}
                          {course?.duration && <div>⏱️ Duration: {course.duration}</div>}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span className="chip chip-primary">Start learning</span>
                          <span className="chip chip-muted">Status: {enr.paymentStatus}</span>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>📜 Transaction History</h2>
            {loading ? (
              <div className="loading"></div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <table className="table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.type}</td>
                        <td>${tx.amount}</td>
                        <td>{tx.description || '-'}</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transfer Money</h2>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>×</button>
            </div>
            <form onSubmit={transfer}>
              <div className="form-group">
                <label>Select Recipient *</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ marginBottom: '8px' }}
                />
                <select
                  value={transferForm.toUserId}
                  onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select a student --</option>
                  {studentsList
                    .filter(student => 
                      !studentSearch || 
                      student.displayName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.studentId?.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.displayName}
                      </option>
                    ))}
                </select>
                {studentsList.length === 0 && (
                  <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                    No students available for transfer
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>Amount (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Transfer</button>
                <button type="button" onClick={() => setShowTransferModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
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
                    color: '#667eea'
                  }}>
                    {notification.tempPassword}
                  </code>
                </div>
              )}
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserInfo && (
        <div className="modal" onClick={() => { setShowUserInfo(false); setIsEditingProfile(false) }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>👤 Account Info</h2>
              <button className="close-btn" onClick={() => setShowUserInfo(false)}>×</button>
            </div>

            {userInfoLoading ? (
              <div className="loading" style={{ margin: '18px 0' }} />
            ) : (
              <div style={{ display: 'grid', gap: '12px', paddingTop: '6px' }}>
                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Signed in</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>{userInfo?.username || user?.username}</div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="chip chip-primary">Role: {userInfo?.role || user?.role}</span>
                    {userInfo?.id && <span className="chip chip-muted">User ID: {userInfo.id}</span>}
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700 }}>Email</div>
                      <div style={{ marginTop: '6px', fontWeight: 700, color: '#111827' }}>{userInfo?.email || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700 }}>Student ID</div>
                      <div style={{ marginTop: '6px', fontWeight: 700, color: '#111827' }}>{userInfo?.studentId || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700 }}>Full name</div>
                      <div style={{ marginTop: '6px', fontWeight: 700, color: '#111827' }}>{userInfo?.fullName || '—'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditingProfile((v) => !v)}
                    disabled={profileSaving}
                  >
                    {isEditingProfile ? 'Done' : 'Edit profile'}
                  </button>

                  <button type="button" className="btn" style={{ background: '#f0f0f0', color: '#333' }} onClick={() => setShowUserInfo(false)}>
                    Close
                  </button>
                </div>

                {isEditingProfile && (
                  <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
                    <form className="card" style={{ padding: '16px' }} onSubmit={saveProfile}>
                      <h3 style={{ marginBottom: '10px' }}>Update profile</h3>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Full name</label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                          Save
                        </button>
                      </div>
                    </form>

                    <form className="card" style={{ padding: '16px' }} onSubmit={changePassword}>
                      <h3 style={{ marginBottom: '10px' }}>Change password</h3>
                      <div className="form-group">
                        <label>Current password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>New password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                          Update password
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="modal" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>{confirmModal.title}</h2>
              <button className="close-btn" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>×</button>
            </div>
            <div style={{ padding: '20px 0', fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
              {confirmModal.message}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="btn"
                style={{ background: '#f0f0f0', color: '#333' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
