import React, { useMemo, useState } from 'react'
import { Student } from '../../types'
import { CreateStudentModal } from './modals/CreateStudentModal'
import { EditStudentModal } from './modals/EditStudentModal'
import { SetBalanceModal } from './modals/SetBalanceModal'

interface StudentManagementProps {
    students: Student[]
    loading: boolean
    onCreateStudent: (form: any) => Promise<boolean>
    onUpdateStudent: (id: number, form: any) => Promise<boolean>
    onSetBalance: (id: number, form: any) => Promise<boolean>
    error: string
    setShowCreateModal: (show: boolean) => void // Shared with Sidebar
    showCreateModal: boolean
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
    students,
    loading,
    onCreateStudent,
    onUpdateStudent,
    onSetBalance,
    error,
    setShowCreateModal,
    showCreateModal,
}) => {
    const [filter, setFilter] = useState('')

    // Create Student Form State
    const [createForm, setCreateForm] = useState({
        username: '',
        email: '',
        fullName: '',
        studentId: '',
        password: '',
        age: '',
        address: '',
    })

    // Edit Student Form State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        age: '',
        address: '',
    })

    // Set Balance Form State
    const [showBalanceModal, setShowBalanceModal] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
    const [balanceForm, setBalanceForm] = useState({
        balance: '',
        description: '',
    })

    const filteredStudents = useMemo(() => {
        const q = filter.trim().toLowerCase()
        if (!q) return students
        return students.filter((s) =>
            [s.name, s.email, String(s.id), String(s.userId || '')]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        )
    }, [students, filter])

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await onCreateStudent(createForm)
        if (success) {
            setShowCreateModal(false)
            setCreateForm({
                username: '',
                email: '',
                fullName: '',
                studentId: '',
                password: '',
                age: '',
                address: '',
            })
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingStudent?.userId) return
        const success = await onUpdateStudent(editingStudent.userId, editForm)
        if (success) {
            setShowEditModal(false)
            setEditingStudent(null)
        }
    }

    const handleBalanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudentId) return
        const success = await onSetBalance(selectedStudentId, balanceForm)
        if (success) {
            setShowBalanceModal(false)
            setSelectedStudentId(null)
            setBalanceForm({ balance: '', description: '' })
        }
    }

    const openEditModal = (student: Student) => {
        setEditingStudent(student)
        setEditForm({
            fullName: student.name,
            email: student.email,
            age: student.age ? String(student.age) : '',
            address: student.address || '',
        })
        setShowEditModal(true)
    }

    const openBalanceModal = (student: Student) => {
        setSelectedStudentId(student.userId || student.id)
        setShowBalanceModal(true)
    }

    return (
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
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => setShowCreateModal(true)}
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
                        {filter ? 'Try adjusting your search.' : 'Create your first student to get started.'}
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
                                                title="Edit Student"
                                                onClick={() => openEditModal(student)}
                                                style={{ marginRight: '8px' }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="admin-row-action admin-row-action--edit"
                                                title="Set Balance"
                                                onClick={() => openBalanceModal(student)}
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

            {/* Modals */}
            <CreateStudentModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                form={createForm}
                setForm={setCreateForm}
                onSubmit={handleCreateSubmit}
                error={error}
            />
            <EditStudentModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleEditSubmit}
                error={error}
            />
            <SetBalanceModal
                show={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                form={balanceForm}
                setForm={setBalanceForm}
                onSubmit={handleBalanceSubmit}
                error={error}
            />
        </div>
    )
}
