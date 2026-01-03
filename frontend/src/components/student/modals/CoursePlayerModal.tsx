import React from 'react'

interface CoursePlayerModalProps {
    show: boolean
    onClose: () => void
    activeEnrollment: any
    courses: any[]
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
    show,
    onClose,
    activeEnrollment,
    courses,
}) => {
    if (!show || !activeEnrollment) return null

    const courseName = activeEnrollment.course?.name || courses.find(c => c.id === activeEnrollment.courseId)?.name || 'Course Content'

    return (
        <div className="modal" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', width: '1200px', height: '85vh', borderRadius: '24px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>
                            {courseName}
                        </h2>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Module 1: Introduction • Lesson 1 of 12</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', fontSize: '20px' }}>×</button>
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
    )
}
