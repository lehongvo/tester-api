export interface User {
    id: number
    username: string
    role: 'admin' | 'student'
    email?: string
    fullName?: string
    studentId?: string
}

export interface Student {
    id: number
    name: string
    email: string
    age?: number
    address?: string
    balance?: number
    userId?: number
}

export interface Account {
    id?: number
    balance: number
    currency: string
}

export interface Course {
    id: number
    name: string
    price: number
    description?: string
    instructor?: string
    duration?: string
}

export interface Transaction {
    id: number
    fromUserId?: number
    toUserId?: number
    amount: number
    type: 'transfer' | 'payment' | 'adjustment' | 'DEPOSIT' | 'REFUND'
    description?: string
    createdAt: string
}

export interface Voucher {
    id: number
    code: string
    userId: number
    percent: number
    used: boolean
    usedAt?: string
    usedCourseId?: number
    createdAt: string
}

export interface Enrollment {
    id: number
    userId: number
    courseId: number
    paymentStatus: 'paid' | 'pending' | 'failed'
    status?: string // For backward compatibility if needed
    enrolledAt?: string
    enrollmentDate?: string // For fallback
    createdAt?: string // For fallback
    course?: Course
}
