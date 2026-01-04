import React, { useMemo, useState } from 'react'

interface CoursePlayerModalProps {
    show: boolean
    onClose: () => void
    activeEnrollment: any
    courses: any[]
}

type DemoLesson = {
    id: number
    title: string
    duration: string
    videoUrl: string
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
    show,
    onClose,
    activeEnrollment,
    courses,
}) => {
    if (!show || !activeEnrollment) return null

    const courseName =
        activeEnrollment.course?.name ||
        courses.find((c) => c.id === activeEnrollment.courseId)?.name ||
        'Course Content'

    const lessons: DemoLesson[] = useMemo(
        () => [
            {
                id: 1,
                title: 'Getting Started',
                duration: '12 minutes',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            },
            {
                id: 2,
                title: 'Core Concepts Part 1',
                duration: '12 minutes',
                videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            },
            {
                id: 3,
                title: 'Core Concepts Part 2',
                duration: '12 minutes',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            },
            {
                id: 4,
                title: 'Core Concepts Part 3',
                duration: '12 minutes',
                videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            },
            {
                id: 5,
                title: 'Core Concepts Part 4',
                duration: '12 minutes',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            },
            {
                id: 6,
                title: 'Wrap Up',
                duration: '10 minutes',
                videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            },
        ],
        [],
    )

    const [selectedLessonId, setSelectedLessonId] = useState<number>(lessons[0]?.id ?? 1)
    const [isPlaying, setIsPlaying] = useState(false)

    const selectedLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0]

    const close = () => {
        setIsPlaying(false)
        onClose()
    }

    return (
        <div className="modal" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={close}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '95vw',
                    width: '1200px',
                    height: '85vh',
                    borderRadius: '24px',
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0f172a',
                }}
            >
                <div
                    style={{
                        padding: '20px 32px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>{courseName}</h2>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                            Module 1: Introduction • Lesson {selectedLesson?.id || 1} of {lessons.length}
                        </div>
                    </div>
                    <button
                        onClick={close}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            fontSize: '20px',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Video Area */}
                    <div style={{ flex: 1, position: 'relative', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!isPlaying ? (
                            <div style={{ textAlign: 'center', padding: '0 24px' }}>
                                <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.5 }}>🎬</div>
                                <div style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>Lesson Video (Demo)</div>
                                <div style={{ color: '#94a3b8', marginTop: '8px' }}>
                                    Selected: <span style={{ color: 'white', fontWeight: 700 }}>{selectedLesson?.title}</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ marginTop: '24px' }}
                                    onClick={() => setIsPlaying(true)}
                                >
                                    PLAY LESSON
                                </button>
                            </div>
                        ) : (
                            <video
                                key={`${selectedLessonId}-${selectedLesson?.videoUrl}`}
                                src={selectedLesson?.videoUrl}
                                controls
                                autoPlay
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        )}

                        {/* Progress Bar Overlay (static demo) */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                            <div style={{ width: isPlaying ? '65%' : '35%', height: '100%', background: '#6366f1', transition: 'width 0.4s ease' }} />
                        </div>
                    </div>

                    {/* Sidebar - Course Content List */}
                    <div
                        style={{
                            width: '320px',
                            background: '#1e293b',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            overflowY: 'auto',
                            padding: '20px',
                        }}
                    >
                        <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                            Course Content
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {lessons.map((lesson) => {
                                const active = lesson.id === selectedLessonId
                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => {
                                            setSelectedLessonId(lesson.id)
                                            setIsPlaying(false)
                                        }}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                            border: active ? '1px solid #6366f1' : '1px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '40%',
                                                    border: '2px solid',
                                                    borderColor: active ? '#6366f1' : '#475569',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                }}
                                            >
                                                {active ? '▶️' : ''}
                                            </div>
                                            <div style={{ color: active ? 'white' : '#cbd5e1', fontSize: '14px', fontWeight: active ? '600' : '400' }}>
                                                Lesson {lesson.id}: {lesson.title}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '30px', marginTop: '4px' }}>{lesson.duration}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
