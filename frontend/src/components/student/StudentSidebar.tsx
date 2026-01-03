import React from 'react'

interface StudentSidebarProps {
    user: any
    activeTab: string
    setActiveTab: (tab: string) => void
    setShowTransferModal: (show: boolean) => void
    logout: () => void
    openUserInfo: () => void
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
    user,
    activeTab,
    setActiveTab,
    setShowTransferModal,
    logout,
    openUserInfo,
}) => {
    return (
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
                    onClick={() => setActiveTab('courses')}
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
    )
}
