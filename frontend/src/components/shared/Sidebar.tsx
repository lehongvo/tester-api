import React from 'react'
import { User } from '../../types'

interface SidebarProps {
    user: User | null
    adminTab: 'students' | 'courses' | 'transactions' | 'vouchers'
    setAdminTab: (tab: 'students' | 'courses' | 'transactions' | 'vouchers') => void
    studentsCount: number
    coursesCount: number
    transactionsCount: number
    vouchersCount: number
    setShowCreateStudentModal: (show: boolean) => void
    setShowCreateCourseModal: (show: boolean) => void
    openUserInfo: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
    user,
    adminTab,
    setAdminTab,
    studentsCount,
    coursesCount,
    transactionsCount,
    vouchersCount,
    setShowCreateStudentModal,
    setShowCreateCourseModal,
    openUserInfo,
}) => {
    return (
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
                        <span className="admin-sidebar__item-badge">{studentsCount}</span>
                    </button>
                    <button
                        className={`admin-sidebar__item ${adminTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setAdminTab('courses')}
                    >
                        <span className="admin-sidebar__item-icon">📚</span>
                        <span className="admin-sidebar__item-text">Courses</span>
                        <span className="admin-sidebar__item-badge">{coursesCount}</span>
                    </button>
                    <button
                        className={`admin-sidebar__item ${adminTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setAdminTab('transactions')}
                    >
                        <span className="admin-sidebar__item-icon">💳</span>
                        <span className="admin-sidebar__item-text">Transactions</span>
                        <span className="admin-sidebar__item-badge">{transactionsCount}</span>
                    </button>
                    <button
                        className={`admin-sidebar__item ${adminTab === 'vouchers' ? 'active' : ''}`}
                        onClick={() => setAdminTab('vouchers')}
                    >
                        <span className="admin-sidebar__item-icon">🎟️</span>
                        <span className="admin-sidebar__item-text">Vouchers</span>
                        <span className="admin-sidebar__item-badge">{vouchersCount}</span>
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
    )
}
