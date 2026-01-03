import React, { useMemo, useState } from 'react'
import { Course } from '../../types'
import { ConfirmModal } from '../shared/ConfirmModal'
import { CreateCourseModal } from './modals/CreateCourseModal'
import { EditCourseModal } from './modals/EditCourseModal'

interface CourseManagementProps {
    courses: Course[]
    loading: boolean
    onCreateCourse: (form: any) => Promise<boolean>
    onUpdateCourse: (id: number, form: any) => Promise<boolean>
    onDeleteCourse: (id: number) => Promise<boolean>
    error: string
    setShowCreateModal: (show: boolean) => void // Shared with Sidebar
    showCreateModal: boolean
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
    courses,
    loading,
    onCreateCourse,
    onUpdateCourse,
    onDeleteCourse,
    error,
    setShowCreateModal,
    showCreateModal,
}) => {
    const [filter, setFilter] = useState('')

    // Create Form State
    const [createForm, setCreateForm] = useState({
        name: '',
        price: '',
        description: '',
        instructor: '',
        duration: '',
    })

    // Edit Form State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        description: '',
        instructor: '',
        duration: '',
    })

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

    const filteredCourses = useMemo(() => {
        const q = filter.trim().toLowerCase()
        if (!q) return courses
        return courses.filter((c) =>
            [c.name, c.description, c.instructor, c.duration, String(c.id)]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        )
    }, [courses, filter])

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await onCreateCourse(createForm)
        if (success) {
            setShowCreateModal(false)
            setCreateForm({
                name: '',
                price: '',
                description: '',
                instructor: '',
                duration: '',
            })
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingCourse) return
        const success = await onUpdateCourse(editingCourse.id, editForm)
        if (success) {
            setShowEditModal(false)
            setEditingCourse(null)
        }
    }

    const handleDeleteRequest = () => {
        if (!editingCourse) return
        setConfirmModal({
            show: true,
            title: '🗑️ Delete Course',
            message: `Are you sure you want to delete "${editingCourse.name}"?`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }))
                const success = await onDeleteCourse(editingCourse.id)
                if (success) {
                    setShowEditModal(false)
                    setEditingCourse(null)
                }
            },
        })
    }

    const openEditModal = (course: Course) => {
        setEditingCourse(course)
        setEditForm({
            name: course.name,
            price: String(course.price),
            description: course.description || '',
            instructor: course.instructor || '',
            duration: course.duration || '',
        })
        setShowEditModal(true)
    }

    return (
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
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => setShowCreateModal(true)}
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
                        {filter ? 'Try adjusting your search.' : 'Create your first course to get started.'}
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
                                                onClick={() => openEditModal(course)}
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
                                                            setConfirmModal(prev => ({ ...prev, show: false }))
                                                            await onDeleteCourse(course.id)
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

            {/* Modals */}
            <CreateCourseModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                form={createForm}
                setForm={setCreateForm}
                onSubmit={handleCreateSubmit}
                error={error}
            />
            <EditCourseModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleEditSubmit}
                onDelete={handleDeleteRequest}
                error={error}
                editingCourse={editingCourse}
            />
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </div>
    )
}
