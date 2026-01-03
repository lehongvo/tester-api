import React, { useState } from 'react'

interface MyEnrollmentsProps {
    myEnrollments: any[]
    courses: any[]
    myTransactions: any[]
    setActiveTab: (tab: string) => void
    setActiveEnrollment: (enrollment: any) => void
    setShowCoursePlayerModal: (show: boolean) => void
}

export const MyEnrollments: React.FC<MyEnrollmentsProps> = ({
    myEnrollments,
    courses,
    myTransactions,
    setActiveTab,
    setActiveEnrollment,
    setShowCoursePlayerModal,
}) => {
    const [enrollmentSearch, setEnrollmentSearch] = useState('')

    return (
        <div className="animate-fade-in">
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>My Enrollments</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Manage and track your subscribed courses.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="admin-panel__search" style={{ margin: 0 }}>
                            <span className="admin-panel__search-icon">🔍</span>
                            <input
                                type="text"
                                className="admin-panel__search-input"
                                placeholder="Search courses..."
                                value={enrollmentSearch}
                                onChange={(e) => setEnrollmentSearch(e.target.value)}
                                style={{ width: '200px' }}
                            />
                        </div>
                        <div style={{ padding: '6px 12px', background: '#eff6ff', borderRadius: '99px', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                            {myEnrollments.length} Active
                        </div>
                    </div>
                </div>

                {(() => {
                    const filteredEnrollments = myEnrollments.filter((enrollment: any) => {
                        const courseDetails = enrollment.course || courses.find(c => c.id === enrollment.courseId) || {};
                        const courseName = (courseDetails.name || 'Unknown Course').toLowerCase();
                        return courseName.includes(enrollmentSearch.toLowerCase()) ||
                            (enrollment.id.toString().includes(enrollmentSearch));
                    });

                    return filteredEnrollments.length > 0 ? (
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
                                    {filteredEnrollments.map((enrollment: any) => {
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
                    )
                })()}
            </div>
        </div>
    )
}
