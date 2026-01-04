import axios from 'axios'
import { useState } from 'react'
import { Course, Student, Transaction } from '../types'
import { API_URL, getAuthHeaders } from '../utils/api'

export const useAdminData = (logout: () => void) => {
    const [students, setStudents] = useState<Student[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [vouchers, setVouchers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
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

    const fetchAdminData = async () => {
        setLoading(true)
        setError('')
        try {
            const [studentsWithBalancesRes, coursesRes, transactionsRes, vouchersRes] = await Promise.all([
                axios.get(`${API_URL}/admin/students/with-balances`, { headers: getAuthHeaders() }),
                axios.get(`${API_URL}/courses`, { headers: getAuthHeaders() }),
                axios.get(`${API_URL}/admin/transactions`, { headers: getAuthHeaders() }),
                axios.get(`${API_URL}/admin/vouchers`, { headers: getAuthHeaders() }).catch(() => ({ data: [] })),
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
                studentId: item.student?.studentId,
            }))
            setStudents(studentsData)
            setCourses(coursesRes.data)
            setTransactions(transactionsRes.data)
            setVouchers(vouchersRes.data || [])
        } catch (err: any) {
            if (err.response?.status === 401) {
                logout()
            }
            setError('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const createStudent = async (form: any) => {
        setError('')
        try {
            const payload: any = {
                username: form.username,
                email: form.email,
                fullName: form.fullName,
                age: form.age ? parseInt(form.age) : undefined,
                address: form.address || undefined,
            }

            if (form.studentId) payload.studentId = form.studentId
            if (form.password) payload.password = form.password

            const response = await axios.post(
                `${API_URL}/admin/students`,
                payload,
                { headers: getAuthHeaders() }
            )

            setNotification({
                show: true,
                type: 'success',
                title: '✅ Student Created Successfully!',
                message: 'Student account has been created with initial balance of 10,000 USD.',
                tempPassword: response.data.tempPassword,
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 8000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create student')
            return false
        }
    }

    const setStudentBalance = async (studentId: number, form: any) => {
        setError('')
        try {
            await axios.put(
                `${API_URL}/admin/students/${studentId}/balance`,
                {
                    balance: parseFloat(form.balance),
                    description: form.description,
                },
                { headers: getAuthHeaders() }
            )
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Balance Updated!',
                message: `Student balance has been updated to $${form.balance}.`,
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set balance')
            return false
        }
    }

    const updateCourse = async (courseId: number, form: any) => {
        setError('')
        try {
            await axios.patch(
                `${API_URL}/courses/${courseId}`,
                {
                    name: form.name,
                    price: parseFloat(form.price),
                    description: form.description || undefined,
                    instructor: form.instructor || undefined,
                    duration: form.duration || undefined,
                },
                { headers: getAuthHeaders() },
            )
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Course Updated',
                message: 'Course information has been updated successfully.',
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update course')
            return false
        }
    }

    const updateStudent = async (studentUserId: number, form: any) => {
        setError('')
        try {
            await axios.put(
                `${API_URL}/admin/students/${studentUserId}`,
                {
                    fullName: form.fullName,
                    email: form.email,
                    age: form.age ? parseInt(form.age) : undefined,
                    address: form.address,
                },
                { headers: getAuthHeaders() }
            )
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Student Updated',
                message: 'Student information has been updated successfully.',
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update student')
            return false
        }
    }

    const deleteCourse = async (courseId: number) => {
        setError('')
        try {
            await axios.delete(`${API_URL}/courses/${courseId}`, { headers: getAuthHeaders() })
            setNotification({
                show: true,
                type: 'success',
                title: '🗑️ Course Deleted',
                message: 'Course has been deleted successfully.',
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete course')
            return false
        }
    }

    const createCourse = async (form: any) => {
        setError('')
        try {
            await axios.post(
                `${API_URL}/courses`,
                {
                    ...form,
                    price: parseFloat(form.price),
                },
                { headers: getAuthHeaders() }
            )
            setNotification({
                show: true,
                type: 'success',
                title: '✅ Course Created!',
                message: `Course "${form.name}" has been created successfully.`,
            })
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000)
            fetchAdminData()
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create course')
            return false
        }
    }

    return {
        students,
        courses,
        transactions,
        vouchers,
        loading,
        error,
        notification,
        setNotification,
        fetchAdminData,
        createStudent,
        setStudentBalance,
        updateCourse,
        updateStudent,
        deleteCourse,
        createCourse,
    }
}
