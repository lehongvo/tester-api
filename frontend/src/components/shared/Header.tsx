import React from 'react'

interface HeaderProps {
    title: React.ReactNode
    breadcrumb: string
    onRefresh: () => void
    onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumb, onRefresh, onLogout }) => {
    return (
        <header className="admin-header">
            <div className="admin-header__left">
                <h1 className="admin-header__title">
                    {title}
                </h1>
                <div className="admin-header__breadcrumb">
                    <span>{breadcrumb}</span>
                </div>
            </div>
            <div className="admin-header__right">
                <button className="admin-header__btn" title="Refresh" onClick={onRefresh}>
                    🔄
                </button>
                <button className="admin-btn admin-btn--danger" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    )
}
