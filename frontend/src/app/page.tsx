'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

// Types
import { Transaction, User } from '../types'

// Utils
import { API_URL, getAuthHeaders } from '../utils/api'

// Hooks
import { useAdminData } from '../hooks/useAdminData'
import { useStudentData } from '../hooks/useStudentData'

// Components
import { LoginForm } from '../components/auth/LoginForm'
import { Header } from '../components/shared/Header'
import { NotificationToast } from '../components/shared/NotificationToast'
import { Sidebar } from '../components/shared/Sidebar'
import { UserInfoModal } from '../components/shared/UserInfoModal'

// Admin Components
import { CourseManagement } from '../components/admin/CourseManagement'
import { StudentManagement } from '../components/admin/StudentManagement'
import { TransactionManagement } from '../components/admin/TransactionManagement'

// Student Components
import { AvailableCourses } from '../components/student/AvailableCourses'
import { MyEnrollments } from '../components/student/MyEnrollments'
import { StudentDashboard } from '../components/student/StudentDashboard'
import { StudentSidebar } from '../components/student/StudentSidebar'
import { StudentTransactions } from '../components/student/StudentTransactions'
import { CourseDetailModal } from '../components/student/modals/CourseDetailModal'
import { CoursePlayerModal } from '../components/student/modals/CoursePlayerModal'
import { TransactionDetailModal } from '../components/student/modals/TransactionDetailModal'
import { TransferModal } from '../components/student/modals/TransferModal'

export default function Home() {
  // Global State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // UI State
  const [adminTab, setAdminTab] = useState<'students' | 'courses' | 'transactions'>('students')
  const [activeTab, setActiveTab] = useState('dashboard') // Student Tab

  // Modals (Global/Specific)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [userInfoLoading, setUserInfoLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Shared Modals state managed in page for triggering
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false)
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false)

  // Student Specific Modals State
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showCourseDetailModal, setShowCourseDetailModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showCoursePlayerModal, setShowCoursePlayerModal] = useState(false)
  const [activeEnrollment, setActiveEnrollment] = useState<any>(null)
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Forms
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    amount: '',
    description: '',
  })

  // Auth Functions
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  // Hooks
  const {
    students,
    courses: adminCourses,
    transactions: adminTransactions,
    loading: adminLoading,
    error: adminError,
    notification: adminNotification,
    setNotification: setAdminNotification,
    fetchAdminData,
    createStudent,
    updateStudent,
    setStudentBalance,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useAdminData(logout)

  const {
    account,
    availableCourses: studentCourses,
    myEnrollments,
    myTransactions,
    transferStudentsList,
    loading: studentLoading,
    error: studentError,
    notification: studentNotification,
    setNotification: setStudentNotification,
    fetchStudentData,
    transferMoney,
    executePurchase,
  } = useStudentData(logout)

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await transferMoney(transferForm)) {
      setShowTransferModal(false)
      setTransferForm({ toUserId: '', amount: '', description: '' })
    }
  }

  const handleBuyCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to purchase this course?')) {
      await executePurchase(courseId)
    }
  }

  // Initial Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Data Fetching on Auth/Role Change
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        fetchAdminData()
      } else {
        fetchStudentData()
      }
    }
  }, [isAuthenticated, user])

  // Helpers
  const openUserInfo = async () => {
    setShowUserInfo(true)
    setUserInfoLoading(true)
    try {
      if (user?.role === 'student' && user.id) {
        // Fetch student profile wrapper? Logic from original page
        // Original page logic: 
        // if user.role === 'student': fetch /students/${user.id} -> setUserInfo
        // else: setUserInfo(user)
        // Wait, original page fetches /auth/me for profile update?
        // Let's just use current user object or fetch fresh /auth/me
        const res = await axios.get(`${API_URL}/auth/me`, { headers: getAuthHeaders() })
        setUserInfo(res.data)
      } else {
        // Admin or fallback
        const res = await axios.get(`${API_URL}/auth/me`, { headers: getAuthHeaders() })
        setUserInfo(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUserInfoLoading(false)
    }
  }

  const handleProfileUpdate = (updatedUser: any) => {
    setUserInfo(updatedUser)
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={(user) => {
          setIsAuthenticated(true)
          setUser(user)
        }}
      />
    )
  }

  const notification = user?.role === 'admin' ? adminNotification : studentNotification
  const setNotification = user?.role === 'admin' ? setAdminNotification : setStudentNotification

  if (user?.role === 'admin') {
    return (
      <div className="admin-layout">
        <Sidebar
          user={user}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          studentsCount={students.length}
          coursesCount={adminCourses.length}
          transactionsCount={adminTransactions.length}
          setShowCreateStudentModal={setShowCreateStudentModal}
          setShowCreateCourseModal={setShowCreateCourseModal}
          openUserInfo={openUserInfo}
        />
        <main className="admin-main">
          <Header
            title={
              adminTab === 'students' ? '👥 Student Management' :
                adminTab === 'courses' ? '📚 Course Management' :
                  '💳 Global Transactions'
            }
            breadcrumb={`Admin / ${adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}`}
            onRefresh={fetchAdminData}
            onLogout={logout}
          />

          <div className="admin-content">
            {adminTab === 'students' && (
              <StudentManagement
                students={students}
                loading={adminLoading}
                onCreateStudent={createStudent}
                onUpdateStudent={updateStudent}
                onSetBalance={setStudentBalance}
                error={adminError || ''}
                setShowCreateModal={setShowCreateStudentModal}
                showCreateModal={showCreateStudentModal}
              />
            )}
            {adminTab === 'courses' && (
              <CourseManagement
                courses={adminCourses}
                loading={adminLoading}
                onCreateCourse={createCourse}
                onUpdateCourse={updateCourse}
                onDeleteCourse={deleteCourse}
                error={adminError || ''}
                setShowCreateModal={setShowCreateCourseModal}
                showCreateModal={showCreateCourseModal}
              />
            )}
            {adminTab === 'transactions' && (
              <TransactionManagement
                transactions={adminTransactions}
                loading={adminLoading}
                setNotification={setAdminNotification}
              />
            )}
          </div>
        </main>

        <UserInfoModal
          show={showUserInfo}
          onClose={() => setShowUserInfo(false)}
          user={user}
          userInfo={userInfo}
          loading={userInfoLoading}
          onProfileUpdate={handleProfileUpdate}
          setNotification={setAdminNotification}
        />
        <NotificationToast
          notification={adminNotification}
          onClose={() => setAdminNotification({ ...adminNotification, show: false })}
        />
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <StudentSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowTransferModal={setShowTransferModal}
        logout={logout}
        openUserInfo={openUserInfo}
      />
      <main className="admin-main">
        <Header
          title={
            activeTab === 'dashboard' ? 'Student Dashboard' :
              activeTab === 'courses' ? 'Available Courses' :
                activeTab === 'enrollments' ? 'My Enrollments' :
                  'Transaction History'
          }
          breadcrumb={`Student / ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          onRefresh={fetchStudentData}
          onLogout={logout}
        />

        <div className="admin-content">
          {studentError && <div className="error" style={{ marginBottom: '20px' }}>{studentError}</div>}

          {activeTab === 'dashboard' && (
            <StudentDashboard
              userInfo={userInfo || user}
              user={user}
              account={account}
              myEnrollments={myEnrollments}
              myTransactions={myTransactions}
              setShowTransferModal={setShowTransferModal}
              setActiveTab={setActiveTab}
              setSelectedTransaction={setSelectedTransaction}
              setShowTransactionDetailModal={setShowTransactionDetailModal}
            />
          )}

          {activeTab === 'courses' && (
            <AvailableCourses
              courses={studentCourses}
              myEnrollments={myEnrollments}
              buyCourse={handleBuyCourse}
              setSelectedCourse={setSelectedCourse}
              setShowCourseDetailModal={setShowCourseDetailModal}
            />
          )}

          {activeTab === 'enrollments' && (
            <MyEnrollments
              myEnrollments={myEnrollments}
              courses={studentCourses}
              myTransactions={myTransactions}
              setActiveTab={setActiveTab}
              setActiveEnrollment={setActiveEnrollment}
              setShowCoursePlayerModal={setShowCoursePlayerModal}
            />
          )}

          {activeTab === 'history' && (
            <StudentTransactions
              myTransactions={myTransactions}
              userInfo={userInfo}
              user={user}
              setSelectedTransaction={setSelectedTransaction}
              setShowTransactionDetailModal={setShowTransactionDetailModal}
            />
          )}
        </div>
      </main>

      {/* Shared/Global Modals */}
      <UserInfoModal
        show={showUserInfo}
        onClose={() => setShowUserInfo(false)}
        user={user}
        userInfo={userInfo}
        loading={userInfoLoading}
        onProfileUpdate={handleProfileUpdate}
        setNotification={setStudentNotification}
      />
      <NotificationToast
        notification={studentNotification}
        onClose={() => setStudentNotification({ ...studentNotification, show: false })}
      />

      {/* Student Specific Modals */}
      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransfer}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        transferStudentsList={transferStudentsList}
        currentUserId={user?.id || 0}
      />

      <CourseDetailModal
        show={showCourseDetailModal}
        onClose={() => setShowCourseDetailModal(false)}
        selectedCourse={selectedCourse}
        onBuyCourse={handleBuyCourse}
        isEnrolled={selectedCourse && myEnrollments.some(e => e.courseId === selectedCourse.id || e.course?.id === selectedCourse.id)}
        notificationHandler={setStudentNotification}
      />

      <CoursePlayerModal
        show={showCoursePlayerModal}
        onClose={() => setShowCoursePlayerModal(false)}
        activeEnrollment={activeEnrollment}
        courses={studentCourses}
      />

      <TransactionDetailModal
        show={showTransactionDetailModal}
        onClose={() => setShowTransactionDetailModal(false)}
        selectedTransaction={selectedTransaction}
        currentUserId={user?.id || 0}
      />
    </div>
  )
}
