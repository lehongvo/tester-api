'use client'

import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([])
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('')
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

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
  })

  // Transaction Filters
  const [txFilterDateFrom, setTxFilterDateFrom] = useState('')
  const [txFilterDateTo, setTxFilterDateTo] = useState('')
  const [txFilterType, setTxFilterType] = useState('all')
  const [txFilterAmountMin, setTxFilterAmountMin] = useState('')
  const [txFilterAmountMax, setTxFilterAmountMax] = useState('')

  // Course & Enrollment Details
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showCourseDetailModal, setShowCourseDetailModal] = useState(false)
  const [activeEnrollment, setActiveEnrollment] = useState<any>(null)
  const [showCoursePlayerModal, setShowCoursePlayerModal] = useState(false)

  const filteredMyTransactions = myTransactions.filter((tx: any) => {
    // Date Filter
    if (txFilterDateFrom) {
      const txDate = new Date(tx.createdAt)
      txDate.setHours(0, 0, 0, 0)
      const fromDate = new Date(txFilterDateFrom)
      fromDate.setHours(0, 0, 0, 0)
      if (txDate.getTime() < fromDate.getTime()) return false
    }
    if (txFilterDateTo) {
      const txDate = new Date(tx.createdAt)
      txDate.setHours(0, 0, 0, 0)
      const toDate = new Date(txFilterDateTo)
      toDate.setHours(0, 0, 0, 0)
      if (txDate.getTime() > toDate.getTime()) return false
    }

    // Type Filter
    if (txFilterType !== 'all') {
      if ((tx.type || '').toLowerCase() !== txFilterType.toLowerCase()) return false
    }

    // Amount Filter
    if (txFilterAmountMin || txFilterAmountMax) {
      const amount = Math.abs(Number(tx.amount))
      if (txFilterAmountMin && amount < Number(txFilterAmountMin)) return false
      if (txFilterAmountMax && amount > Number(txFilterAmountMax)) return false
    }

    return true
  })



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
      const [accountRes, transactionsRes, enrollmentsRes, vouchersRes, coursesRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/me/account`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/transactions/history`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/enrollments`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/me/vouchers`, { headers: getAuthHeaders() }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/courses`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/transfer/students`, { headers: getAuthHeaders() }).catch(() => ({ data: [] })),
      ])
      setAccount(accountRes.data)
      setMyTransactions(transactionsRes.data)
      setMyEnrollments(enrollmentsRes.data)
      setMyVouchers(vouchersRes.data || [])
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


  const buyCourse = async (courseId: number) => {
    // reset voucher selection each time opening confirm
    // (user can pick voucher in the course detail modal before confirming)

    const course = courses.find(c => c.id === courseId)
    setConfirmModal({
      show: true,
      title: '🛒 Confirm Course Purchase',
      message: `Are you sure you want to purchase "${course?.name}" for ${course?.price}${selectedVoucherCode ? ` (voucher: ${selectedVoucherCode})` : ''}?`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false })
        setError('')
        try {
          const response = await axios.post(
            `${API_URL}/courses/${courseId}/buy`,
            { voucherCode: selectedVoucherCode || undefined },
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
    // Get greeting based on time
    const getGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning'
      if (hour < 18) return 'Good afternoon'
      return 'Good evening'
    }

  return (
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__logo">
            <div className="admin-sidebar__logo-icon">🏦</div>
    <div>
              <div className="admin-sidebar__logo-text">School Bank</div>
              <div className="admin-sidebar__logo-sub">Admin Portal</div>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            <div className="admin-sidebar__section">
              <div className="admin-sidebar__section-title">Main Menu</div>
              <button
                className={`admin-sidebar__item ${adminTab === 'students' ? 'active' : ''}`}
                onClick={() => setAdminTab('students')}
              >
                <span className="admin-sidebar__item-icon">👥</span>
                <span className="admin-sidebar__item-text">Students</span>
                <span className="admin-sidebar__item-badge">{students.length}</span>
              </button>
              <button
                className={`admin-sidebar__item ${adminTab === 'courses' ? 'active' : ''}`}
                onClick={() => setAdminTab('courses')}
              >
                <span className="admin-sidebar__item-icon">📚</span>
                <span className="admin-sidebar__item-text">Courses</span>
                <span className="admin-sidebar__item-badge">{courses.length}</span>
            </button>
              <button
                className={`admin-sidebar__item ${adminTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setAdminTab('transactions')}
              >
                <span className="admin-sidebar__item-icon">💳</span>
                <span className="admin-sidebar__item-text">Transactions</span>
                <span className="admin-sidebar__item-badge">{transactions.length}</span>
            </button>
          </div>

            <div className="admin-sidebar__section">
              <div className="admin-sidebar__section-title">Quick Actions</div>
              <button
                className="admin-sidebar__item"
                onClick={() => setShowCreateStudentModal(true)}
              >
                <span className="admin-sidebar__item-icon">➕</span>
                <span className="admin-sidebar__item-text">New Student</span>
              </button>
              <button
                className="admin-sidebar__item"
                onClick={() => setShowCreateCourseModal(true)}
              >
                <span className="admin-sidebar__item-icon">📝</span>
                <span className="admin-sidebar__item-text">New Course</span>
              </button>
        </div>
          </nav>

          <div className="admin-sidebar__footer">
            <button className="admin-sidebar__user" onClick={openUserInfo}>
              <div className="admin-sidebar__user-avatar">
                {String(user?.username || 'A').charAt(0).toUpperCase()}
      </div>
              <div className="admin-sidebar__user-info">
                <div className="admin-sidebar__user-name">{user?.username}</div>
                <div className="admin-sidebar__user-role">Administrator</div>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Header */}
          <header className="admin-header">
            <div className="admin-header__left">
              <h1 className="admin-header__title">
                {adminTab === 'students' && '👥 Students'}
                {adminTab === 'courses' && '📚 Courses'}
                {adminTab === 'transactions' && '💳 Transactions'}
              </h1>
              <div className="admin-header__breadcrumb">
                <span>Admin</span>
                <span className="admin-header__breadcrumb-sep">/</span>
                <span style={{ textTransform: 'capitalize' }}>{adminTab}</span>
              </div>
            </div>
            <div className="admin-header__right">
              <button className="admin-header__btn" title="Refresh" onClick={fetchAdminData}>
                🔄
              </button>
              <button className="admin-btn admin-btn--danger" onClick={logout}>
                Logout
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="admin-content">
            {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

            {/* Welcome & Stats */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {getGreeting()}, {user?.username}! 👋
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Here&apos;s what&apos;s happening with your school bank today.
              </p>
                </div>

            {/* Stat Cards */}
            <div className="admin-stats">
              <button
                className="admin-stat-card"
                onClick={() => setAdminTab('students')}
                style={{ border: 'none', textAlign: 'left' }}
              >
                <div className="admin-stat-card__header">
                  <div className="admin-stat-card__icon admin-stat-card__icon--primary">👥</div>
                  <span className="admin-stat-card__label">Students</span>
              </div>
                <div className="admin-stat-card__value">{students.length}</div>
                <div className="admin-stat-card__trend admin-stat-card__trend--up">
                  Active accounts
            </div>
              </button>

              <button
                className="admin-stat-card"
                onClick={() => setAdminTab('courses')}
                style={{ border: 'none', textAlign: 'left' }}
              >
                <div className="admin-stat-card__header">
                  <div className="admin-stat-card__icon admin-stat-card__icon--success">📚</div>
                  <span className="admin-stat-card__label">Courses</span>
                </div>
                <div className="admin-stat-card__value">{courses.length}</div>
                <div className="admin-stat-card__trend admin-stat-card__trend--up">
                  Available courses
              </div>
              </button>

              <button
                className="admin-stat-card"
                onClick={() => setAdminTab('transactions')}
                style={{ border: 'none', textAlign: 'left' }}
              >
                <div className="admin-stat-card__header">
                  <div className="admin-stat-card__icon admin-stat-card__icon--warning">💳</div>
                  <span className="admin-stat-card__label">Transactions</span>
            </div>
                <div className="admin-stat-card__value">{transactions.length}</div>
                <div className="admin-stat-card__trend">
                  All time
                </div>
              </button>
              </div>

            {/* Students Panel */}
            {adminTab === 'students' && (
              <div className="admin-panel">
                <div className="admin-panel__header">
                  <h3 className="admin-panel__title">👥 Student Management</h3>
                  <div className="admin-panel__actions">
                    <div className="admin-panel__search">
                      <span className="admin-panel__search-icon">🔍</span>
                      <input
                        type="text"
                        className="admin-panel__search-input"
                        placeholder="Search students..."
                        value={studentFilter}
                        onChange={(e) => setStudentFilter(e.target.value)}
                      />
                    </div>
                    <button
                      className="admin-btn admin-btn--primary"
                      onClick={() => setShowCreateStudentModal(true)}
                    >
                      ➕ Add Student
                    </button>
            </div>
          </div>

        {loading ? (
              <div className="loading"></div>
                ) : filteredStudents.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty__icon">👥</div>
                    <h4 className="admin-empty__title">No students found</h4>
                    <p className="admin-empty__text">
                      {studentFilter ? 'Try adjusting your search.' : 'Create your first student to get started.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Address</th>
                          <th>Balance</th>
                          <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
                        {filteredStudents.map((student) => (
                  <tr key={student.id}>
                            <td style={{ fontWeight: 600, color: '#64748b' }}>#{student.id}</td>
                            <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td>{student.email}</td>
                            <td>{student.age || '—'}</td>
                            <td>{student.address || '—'}</td>
                            <td>
                              <span style={{
                                fontWeight: 700,
                                color: '#10b981',
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '4px 10px',
                                borderRadius: '6px'
                              }}>
                            ${student.balance?.toFixed(2) || '0.00'}
                              </span>
                          </td>
                    <td>
                              <div className="admin-row-actions" style={{ opacity: 1 }}>
                      <button
                                  className="admin-row-action admin-row-action--edit"
                                  title="Set Balance"
                              onClick={() => {
                                setSelectedStudentId(student.userId || student.id)
                                setShowSetBalanceModal(true)
                              }}
                            >
                                  💰
                      </button>
                              </div>
                    </td>
                  </tr>
                        ))}
            </tbody>
          </table>
          </div>
        )}
          </div>
            )}

            {/* Courses Panel */}
            {adminTab === 'courses' && (
              <div className="admin-panel">
                <div className="admin-panel__header">
                  <h3 className="admin-panel__title">📚 Course Management</h3>
                  <div className="admin-panel__actions">
                    <div className="admin-panel__search">
                      <span className="admin-panel__search-icon">🔍</span>
                      <input
                        type="text"
                        className="admin-panel__search-input"
                        placeholder="Search courses..."
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                      />
                    </div>
                    <button
                      className="admin-btn admin-btn--primary"
                      onClick={() => setShowCreateCourseModal(true)}
                    >
                      ➕ Add Course
                    </button>
                  </div>
                </div>

            {loading ? (
              <div className="loading"></div>
                ) : filteredCourses.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty__icon">📚</div>
                    <h4 className="admin-empty__title">No courses found</h4>
                    <p className="admin-empty__text">
                      {courseFilter ? 'Try adjusting your search.' : 'Create your first course to get started.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                          <th>Price</th>
                      <th>Instructor</th>
                      <th>Duration</th>
                          <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                        {filteredCourses.map((course) => (
                      <tr key={course.id}>
                            <td style={{ fontWeight: 600, color: '#64748b' }}>#{course.id}</td>
                            <td style={{ fontWeight: 600 }}>{course.name}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#4f46e5' }}>
                                ${course.price}
                              </span>
                            </td>
                            <td>{course.instructor || '—'}</td>
                            <td>{course.duration || '—'}</td>
                            <td>
                              <div className="admin-row-actions" style={{ opacity: 1 }}>
                                <button
                                  className="admin-row-action admin-row-action--edit"
                                  title="Edit Course"
                                  onClick={() => openEditCourse(course)}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="admin-row-action admin-row-action--delete"
                                  title="Delete Course"
                                  onClick={() => {
                                    setEditingCourse(course)
                                    setConfirmModal({
                                      show: true,
                                      title: '🗑️ Delete Course',
                                      message: `Are you sure you want to delete "${course.name}"?`,
                                      onConfirm: async () => {
                                        setConfirmModal({ ...confirmModal, show: false })
                                        await deleteCourse()
                                      },
                                    })
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            )}

            {/* Transactions Panel */}
            {adminTab === 'transactions' && (
              <div className="admin-panel">
                <div className="admin-panel__header">
                  <h3 className="admin-panel__title">💳 Transaction History</h3>
                  <div className="admin-panel__actions">
                    <div className="admin-panel__search">
                      <span className="admin-panel__search-icon">🔍</span>
                      <input
                        type="text"
                        className="admin-panel__search-input"
                        placeholder="Search transactions..."
                        value={transactionFilter}
                        onChange={(e) => setTransactionFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

            {loading ? (
              <div className="loading"></div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty__icon">💳</div>
                    <h4 className="admin-empty__title">No transactions found</h4>
                    <p className="admin-empty__text">
                      {transactionFilter ? 'Try adjusting your search.' : 'Transactions will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
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
                        {filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setNotification({
                                show: true,
                                type: 'info',
                                title: '💳 Transaction Detail',
                                message: `#${tx.id} • ${tx.type} • $${tx.amount} • From ${tx.fromUserId || '—'} → To ${tx.toUserId || '—'}${tx.description ? ` • ${tx.description}` : ''}`,
                              })
                              setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000)
                            }}
                          >
                            <td style={{ fontWeight: 600, color: '#64748b' }}>#{tx.id}</td>
                            <td>
                              <span className={`admin-status admin-status--${tx.type}`}>
                                {tx.type === 'transfer' && '↔️'}
                                {tx.type === 'payment' && '💰'}
                                {tx.type === 'adjustment' && '⚙️'}
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.fromUserId || '—'}</td>
                            <td>{tx.toUserId || '—'}</td>
                            <td style={{ fontWeight: 700 }}>${tx.amount}</td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.description || '—'}
                            </td>
                            <td style={{ color: '#64748b', fontSize: '13px' }}>
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            )}
        </div>
        </main>

        {/* Create Student Modal */}
        {showCreateStudentModal && (
          <div className="modal" onClick={() => setShowCreateStudentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Create Student User</h2>
                <button className="close-btn" onClick={() => setShowCreateStudentModal(false)}>×</button>
              </div>
              <form onSubmit={createStudentUser}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Username <span>*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createStudentForm.username}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email <span>*</span></label>
                  <input
                    type="email"
                    className="admin-form-input"
                    value={createStudentForm.email}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name <span>*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createStudentForm.fullName}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Password (optional - auto-generated if empty)</label>
                  <input
                    type="password"
                    className="admin-form-input"
                    value={createStudentForm.password}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, password: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Age</label>
                  <input
                    type="number"
                      className="admin-form-input"
                    value={createStudentForm.age}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, age: e.target.value })}
                  />
                </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Address</label>
                  <input
                    type="text"
                      className="admin-form-input"
                    value={createStudentForm.address}
                    onChange={(e) => setCreateStudentForm({ ...createStudentForm, address: e.target.value })}
                  />
                  </div>
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Create Student</button>
                  <button type="button" onClick={() => setShowCreateStudentModal(false)} className="admin-btn admin-btn--secondary">Cancel</button>
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
                <h2>💰 Set Student Balance</h2>
                <button className="close-btn" onClick={() => setShowSetBalanceModal(false)}>×</button>
              </div>
              <form onSubmit={setStudentBalance}>
                <div className="admin-form-group">
                  <label className="admin-form-label">New Balance (USD) <span>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={setBalanceForm.balance}
                    onChange={(e) => setSetBalanceForm({ ...setBalanceForm, balance: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={setBalanceForm.description}
                    onChange={(e) => setSetBalanceForm({ ...setBalanceForm, description: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Set Balance</button>
                  <button type="button" onClick={() => setShowSetBalanceModal(false)} className="admin-btn admin-btn--secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditCourseModal && editingCourse && (
          <div className="modal" onClick={() => setShowEditCourseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Edit Course</h2>
                <button className="close-btn" onClick={() => setShowEditCourseModal(false)}>×</button>
              </div>
              <form onSubmit={saveCourseEdits}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Course Name <span>*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editCourseForm.name}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (USD) <span>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={editCourseForm.price}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editCourseForm.description}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Instructor</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editCourseForm.instructor}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Duration</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editCourseForm.duration}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Save</button>
                  <button type="button" onClick={() => setShowEditCourseModal(false)} className="admin-btn admin-btn--secondary">Cancel</button>
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
                    className="admin-btn admin-btn--danger"
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
                <h2>📝 Create Course</h2>
                <button className="close-btn" onClick={() => setShowCreateCourseModal(false)}>×</button>
              </div>
              <form onSubmit={createCourse}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Course Name <span>*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createCourseForm.name}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (USD) <span>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={createCourseForm.price}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createCourseForm.description}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, description: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Instructor</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createCourseForm.instructor}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Duration</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={createCourseForm.duration}
                    onChange={(e) => setCreateCourseForm({ ...createCourseForm, duration: e.target.value })}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Create</button>
                  <button type="button" onClick={() => setShowCreateCourseModal(false)} className="admin-btn admin-btn--secondary">Cancel</button>
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
                      color: '#4f46e5'
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
                      className="admin-btn admin-btn--primary"
                      onClick={() => setIsEditingProfile((v) => !v)}
                      disabled={profileSaving}
                    >
                      {isEditingProfile ? 'Done' : 'Edit profile'}
                    </button>

                    <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowUserInfo(false)}>
                      Close
                    </button>
              </div>

                  {isEditingProfile && (
                    <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
                      <form className="card" style={{ padding: '16px' }} onSubmit={saveProfile}>
                        <h3 style={{ marginBottom: '10px' }}>Update profile</h3>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Email</label>
                          <input
                            type="email"
                            className="admin-form-input"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          />
              </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Full name</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          />
            </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button type="submit" className="admin-btn admin-btn--primary" disabled={profileSaving}>
                            Save
            </button>
          </div>
                      </form>

                      <form className="card" style={{ padding: '16px' }} onSubmit={changePassword}>
                        <h3 style={{ marginBottom: '10px' }}>Change password</h3>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Current password</label>
                          <input
                            type="password"
                            className="admin-form-input"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                          />
        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">New password</label>
                          <input
                            type="password"
                            className="admin-form-input"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                          />
      </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button type="submit" className="admin-btn admin-btn--primary" disabled={profileSaving}>
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
                  className="admin-btn admin-btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="admin-btn admin-btn--primary"
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

  // Student Dashboard
  return (
    <div className="admin-layout">
      {/* Student Sidebar */}
      <aside className="admin-sidebar" style={{ background: '#0f172a' }}>
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            🎓
          </div>
          <div className="admin-sidebar__logo-text">
            Student Portal
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-sidebar__item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <span className="admin-sidebar__item-icon">📊</span>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`admin-sidebar__item ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <span className="admin-sidebar__item-icon">📚</span>
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`admin-sidebar__item ${activeTab === 'enrollments' ? 'active' : ''}`}
          >
            <span className="admin-sidebar__item-icon">🎓</span>
            Enrollments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`admin-sidebar__item ${activeTab === 'history' ? 'active' : ''}`}
          >
            <span className="admin-sidebar__item-icon">📜</span>
            History
          </button>

          <div style={{ padding: '24px 20px 10px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Actions
        </div>

          <button
            onClick={() => setShowTransferModal(true)}
            className="admin-sidebar__item"
          >
            <span className="admin-sidebar__item-icon">💸</span>
            Transfer Money
          </button>
          <button
            onClick={() => { setActiveTab('courses'); /* Logic to show all courses if separate */ }}
            className="admin-sidebar__item"
          >
            <span className="admin-sidebar__item-icon">🛍️</span>
            Buy Course
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {String(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>Student Account</div>
            </div>
            <button onClick={logout} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }} title="Logout">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
              {activeTab === 'dashboard' && 'Student Dashboard'}
              {activeTab === 'courses' && 'Available Courses'}
              {activeTab === 'enrollments' && 'My Enrollments'}
              {activeTab === 'history' && 'Transaction History'}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              Balance: <span style={{ color: '#10b981' }}>${Number(account?.balance ?? 0).toFixed(2)}</span>
            </div>
              <button 
              className="admin-btn admin-btn--secondary"
              onClick={openUserInfo}
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
            >
              👤 Profile
              </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Top Hero Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                {/* Transfer Money Hero Card */}
                <div
                  onClick={() => setShowTransferModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '16px',
                    padding: '32px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                    transition: 'transform 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="hover-scale"
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                    pointerEvents: 'none'
                  }}></div>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>TRANSFER MONEY</h2>
                  <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Click to start a new transfer</p>
                </div>

                {/* Total Enrollments */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    📈 Total Enrollments
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#3b82f6' }}>
                  {myEnrollments.length}
              </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Click to view details</div>
                </div>

                {/* Total Transactions */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    📜 Total Transactions
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#10b981' }}>
                  {myTransactions.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Lifetime activity</div>
              </div>
            </div>

              {/* Recent Activity Section */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>📜 Recent Transactions</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Overview of your latest financial activity.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="btn"
                    style={{ background: '#4f46e5', color: 'white', padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                  >
                    VIEW ALL
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myTransactions.length > 0 ? (
                    myTransactions.slice(0, 5).map((tx: any) => (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px', background: '#f8fafc', borderRadius: '12px',
                        borderLeft: `4px solid ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '#10b981' : '#ef4444'}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '#10b981' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                          }}>
                            {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '↓' : '↑'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '2px' }}>
                              {tx.description || 'No description'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(tx.createdAt).toLocaleString()} • #{tx.id}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '#10b981' : '#ef4444' }}>
                          {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No recent transactions found.
                </div>
              )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
              <h2>Available Courses</h2>
              <div className="courses-grid">
                {courses.map(course => {
                  const isEnrolled = myEnrollments.some((e: any) => e.courseId === course.id || e.course?.id === course.id);
                  return (
                    <div
                      key={course.id}
                      className="course-card"
                      onClick={() => { setSelectedCourse(course); setShowCourseDetailModal(true); }}
                      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    >
                      <h3>{course.name}</h3>
                      <p>{course.description}</p>
                      <div className="price">${course.price}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); !isEnrolled && buyCourse(course.id) }}
                        disabled={isEnrolled}
                        className={`btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ marginTop: '10px', width: '100%', opacity: isEnrolled ? 0.7 : 1, cursor: isEnrolled ? 'default' : 'pointer' }}
                      >
                        {isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'enrollments' && (
            <div className="animate-fade-in">
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>My Enrollments</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Manage and track your subscribed courses.</p>
                      </div>
                  <div style={{ padding: '6px 12px', background: '#eff6ff', borderRadius: '99px', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                    {myEnrollments.length} Active
                  </div>
                </div>

                {myEnrollments.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px' }}>Course</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Enrolled Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEnrollments.map((enrollment: any) => {
                          // Find course details if not populated
                          const courseDetails = enrollment.course || courses.find(c => c.id === enrollment.courseId) || {};
                          const courseName = courseDetails.name || 'Unknown Course';

                          // Safe date formatting
                          let dateDisplay = 'N/A';
                          try {
                            let dateObj: Date | null = null;
                            if (enrollment.enrollmentDate || enrollment.createdAt) {
                              dateObj = new Date(enrollment.enrollmentDate || enrollment.createdAt);
                            }

                            // Fallback: Try to find purchase transaction
                            if (!dateObj || isNaN(dateObj.getTime())) {
                              const purchaseTx = myTransactions.find((t: any) =>
                                t.description?.includes(courseName) &&
                                (t.type === 'payment' || t.type === 'PAYMENT')
                              );
                              if (purchaseTx?.createdAt) {
                                dateObj = new Date(purchaseTx.createdAt);
                              }
                            }

                            if (dateObj && !isNaN(dateObj.getTime())) {
                              dateDisplay = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            }
                          } catch (e) { console.error('Date error', e) }

                          return (
                            <tr key={enrollment.id} className="hover-row" style={{ transition: 'background 0.2s' }}>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: '#334155' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                    {courseName.charAt(0)}
                                  </div>
                                  <div>
                                    <div>{courseName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{enrollment.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                <span className={`status-badge status-${(enrollment.paymentStatus || enrollment.status || 'active').toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' }}>
                                  {enrollment.paymentStatus || enrollment.status || 'Active'}
                                </span>
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                                {dateDisplay}
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                <button
                                  className="btn-sm"
                                  onClick={() => { setActiveEnrollment(enrollment); setShowCoursePlayerModal(true); }}
                                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #6366f1', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                                  title="Start Learning"
                                >
                                  Go to Learn
                        </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px' }}>No enrollments yet</h3>
                    <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px' }}>You haven't enrolled in any courses yet.</p>
                        <button
                      onClick={() => setActiveTab('courses')}
                          className="btn btn-primary"
                      style={{ padding: '10px 20px' }}
                        >
                      Browse Courses
                        </button>
                  </div>
                      )}
                    </div>
          </div>
        )}

        {activeTab === 'history' && (
            <div className="animate-fade-in">
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Transaction History</h2>
                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Track all your financial activities and payments.</p>
                    </div>
                    <div style={{ padding: '6px 12px', background: '#eff6ff', borderRadius: '99px', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                      {filteredMyTransactions.length} / {myTransactions.length} Total
                    </div>
                  </div>

                  {/* Filters */}
                  {myTransactions.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>FROM DATE</label>
                        <input type="date" value={txFilterDateFrom} onChange={e => setTxFilterDateFrom(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>TO DATE</label>
                        <input type="date" value={txFilterDateTo} onChange={e => setTxFilterDateTo(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>TYPE</label>
                        <select value={txFilterType} onChange={e => setTxFilterType(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white' }}>
                          <option value="all">All Types</option>
                          <option value="payment">Payment</option>
                          <option value="deposit">Deposit</option>
                          <option value="transfer">Transfer</option>
                          <option value="adjustment">Adjustment</option>
                          <option value="refund">Refund</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>MIN AMOUNT</label>
                        <input type="number" placeholder="0" value={txFilterAmountMin} onChange={e => setTxFilterAmountMin(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' }}>MAX AMOUNT</label>
                        <input type="number" placeholder="Max" value={txFilterAmountMax} onChange={e => setTxFilterAmountMax(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setTxFilterDateFrom(''); setTxFilterDateTo(''); setTxFilterType('all');
                            setTxFilterAmountMin(''); setTxFilterAmountMax('');
                          }}
                          className="btn"
                          style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b' }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {myTransactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px' }}>No transactions yet</h3>
                    <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px' }}>Your transaction history will appear here.</p>
                  </div>
                ) : filteredMyTransactions.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px' }}>Type</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                        {myTransactions.map((tx: any) => {
                          // Safe date formatting
                          let dateDisplay = 'N/A';
                          try {
                            if (tx.createdAt) {
                              const date = new Date(tx.createdAt);
                              if (!isNaN(date.getTime())) {
                                dateDisplay = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                              }
                            }
                          } catch (e) { console.error('Date error', e) }

                          const isPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND';

                          return (
                            <tr key={tx.id} className="hover-row" style={{ transition: 'background 0.2s' }}>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                <span className={`status-badge status-${(tx.type || 'unknown').toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                                  {tx.type}
                                </span>
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontWeight: '500' }}>
                                {tx.description}
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                                {dateDisplay}
                              </td>
                              <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold', color: isPositive ? '#10b981' : '#ef4444' }}>
                                {isPositive ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                              </td>
                      </tr>
                          )
                        })}
                  </tbody>
                </table>
              </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px' }}>No transactions yet</h3>
                    <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px' }}>Your transaction history will appear here.</p>
          </div>
        )}
      </div>
            </div>
          )}

          {/* Modals */}
      {showTransferModal && (
        <div className="modal" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                  <h2>💸 Transfer Money</h2>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>×</button>
            </div>
                <form onSubmit={transfer} style={{ padding: '20px 0' }}>
              <div className="form-group">
                    <label>To User ID</label>
                <input
                      type="number"
                      placeholder="Enter recipient ID"
                  value={transferForm.toUserId}
                  onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    />
              </div>
              <div className="form-group">
                    <label>Amount ($)</label>
                <input
                  type="number"
                      placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                      placeholder="What is this for?"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Transfer</button>
                <button type="button" onClick={() => setShowTransferModal(false)} className="btn" style={{ background: '#f0f0f0' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Course Detail Modal */}
          {showCourseDetailModal && selectedCourse && (
            <div className="modal" onClick={() => setShowCourseDetailModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '24px', padding: '0', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '200px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <button onClick={() => setShowCourseDetailModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                  <div style={{ fontSize: '64px' }}>🎓</div>
                </div>
                <div style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>{selectedCourse.name}</h2>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: '99px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>#{selectedCourse.id}</span>
                        <span style={{ padding: '4px 10px', background: '#eff6ff', borderRadius: '99px', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>{selectedCourse.instructor || 'Universal Academy'}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>${selectedCourse.price}</div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>About this course</h3>
                    <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>{selectedCourse.description || 'No description available for this course yet. This comprehensive module covers everything you need to master the subject.'}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>DURATION</div>
                      <div style={{ color: '#334155', fontWeight: '700' }}>{selectedCourse.duration || '12 weeks'}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>LEVEL</div>
                      <div style={{ color: '#334155', fontWeight: '700' }}>Intermediate</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        const isEnrolled = myEnrollments.some((e: any) => e.courseId === selectedCourse.id || e.course?.id === selectedCourse.id);
                        if (!isEnrolled) {
                          buyCourse(selectedCourse.id);
                        } else {
                          setNotification({ show: true, type: 'info', title: 'Already Enrolled', message: 'You already have access to this course.' });
                        }
                        setShowCourseDetailModal(false);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '14px' }}
                    >
                      {myEnrollments.some((e: any) => e.courseId === selectedCourse.id || e.course?.id === selectedCourse.id) ? 'ALREADY ENROLLED' : 'ENROLL NOW'}
                    </button>
                    <button
                      onClick={() => setShowCourseDetailModal(false)}
                      className="btn"
                      style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', fontWeight: '600' }}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Player Modal */}
          {showCoursePlayerModal && activeEnrollment && (
            <div className="modal" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setShowCoursePlayerModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', width: '1200px', height: '85vh', borderRadius: '24px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>
                      {activeEnrollment.course?.name || courses.find(c => c.id === activeEnrollment.courseId)?.name || 'Course Content'}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Module 1: Introduction • Lesson 1 of 12</div>
                  </div>
                  <button onClick={() => setShowCoursePlayerModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', fontSize: '20px' }}>×</button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Video Area */}
                  <div style={{ flex: 1, position: 'relative', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.5 }}>🎬</div>
                      <div style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>Lesson Video Placeholder</div>
                      <div style={{ color: '#94a3b8', marginTop: '8px' }}>Content is loading or not available in this demo.</div>
                      <button className="btn btn-primary" style={{ marginTop: '24px' }}>PLAY LESSON</button>
                    </div>
                    {/* Progress Bar Overlay */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                      <div style={{ width: '35%', height: '100%', background: '#6366f1' }}></div>
                    </div>
                  </div>

                  {/* Sidebar - Course Content List */}
                  <div style={{ width: '320px', background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', padding: '20px' }}>
                    <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Course Content</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: i === 0 ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          border: i === 0 ? '1px solid #6366f1' : '1px solid transparent',
                          cursor: 'pointer'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '40%', border: '2px solid', borderColor: i === 0 ? '#6366f1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                              {i === 0 ? '▶️' : ''}
                            </div>
                            <div style={{ color: i === 0 ? 'white' : '#cbd5e1', fontSize: '14px', fontWeight: i === 0 ? '600' : '400' }}>
                              Lesson {i + 1}: {i === 0 ? 'Getting Started' : `Core Concepts Part ${i}`}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '30px', marginTop: '4px' }}>12 minutes</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Info Modal */}
          {showUserInfo && (
            <div className="modal" onClick={() => setShowUserInfo(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '16px', padding: '0' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 24px' }}>
                  <h2 style={{ fontSize: '18px', color: '#6366f1', margin: 0 }}>User Profile</h2>
                  <button className="close-btn" onClick={() => setShowUserInfo(false)}>×</button>
                </div>
                {userInfoLoading ? (
                  <div className="loading" style={{ margin: '40px auto' }}></div>
                ) : (
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {!isEditingProfile ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>ID:</div>
                            <div style={{ color: '#4b5563' }}>{userInfo?.id || user?.id}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>Username:</div>
                            <div style={{ color: '#4b5563' }}>{userInfo?.username || user?.username}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>Full Name:</div>
                            <div style={{ color: '#4b5563' }}>{userInfo?.fullName || 'N/A'}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>Email:</div>
                            <div style={{ color: '#4b5563' }}>{userInfo?.email || 'N/A'}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>Role:</div>
                            <div style={{ color: '#4b5563', textTransform: 'capitalize' }}>{userInfo?.role || user?.role}</div>
                          </div>

                          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                              onClick={() => setIsEditingProfile(true)}
                              className="btn btn-primary"
                              style={{ flex: 1, textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={() => setConfirmModal({ ...confirmModal, show: true, title: 'Change Password', message: 'Not implemented yet' })}
                              className="btn"
                              style={{ flex: 1, background: '#f3f4f6', color: '#111827', textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}
                            >
                              Change Password
                            </button>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={saveProfile}>
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              value={profileForm.fullName}
                              onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%' }}
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              value={profileForm.email}
                              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="submit" disabled={profileSaving} className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="btn" style={{ flex: 1, background: '#f3f4f6' }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
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
                        color: '#4f46e5'
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
      </main>
    </div>
  )
}
