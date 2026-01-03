import React from 'react'

interface CourseDetailModalProps {
    show: boolean
    onClose: () => void
    selectedCourse: any
    onBuyCourse: (id: number) => void
    isEnrolled: boolean
    notificationHandler: (n: any) => void
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
    show,
    onClose,
    selectedCourse,
    onBuyCourse,
    isEnrolled,
    notificationHandler,
}) => {
    if (!show || !selectedCourse) return null

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '24px', padding: '0', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '200px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                    <div style={{ fontSize: '64px' }}>🎓</div>
                </div>
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>{selectedCourse.name}</h2>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: '99px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>#{selectedCourse.id}</span>
                                <span style={{ padding: '4px 10px', background: '#eff6ff', borderRadius: '99px', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>{selectedCourse.instructor || 'Universal Academy'}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>${selectedCourse.price}</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>About this course</h3>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>{selectedCourse.description || 'No description available for this course yet. This comprehensive module covers everything you need to master the subject.'}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>DURATION</div>
                            <div style={{ color: '#334155', fontWeight: '700' }}>{selectedCourse.duration || '12 weeks'}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>LEVEL</div>
                            <div style={{ color: '#334155', fontWeight: '700' }}>Intermediate</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                if (!isEnrolled) {
                                    onBuyCourse(selectedCourse.id);
                                } else {
                                    notificationHandler({ show: true, type: 'info', title: 'Already Enrolled', message: 'You already have access to this course.' });
                                }
                                onClose();
                            }}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '14px' }}
                        >
                            {isEnrolled ? 'ALREADY ENROLLED' : 'ENROLL NOW'}
                        </button>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', fontWeight: '600' }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
