import React from 'react'

interface AvailableCoursesProps {
    courses: any[]
    myEnrollments: any[]
    buyCourse: (id: number) => void
    setSelectedCourse: (course: any) => void
    setShowCourseDetailModal: (show: boolean) => void
}

export const AvailableCourses: React.FC<AvailableCoursesProps> = ({
    courses,
    myEnrollments,
    buyCourse,
    setSelectedCourse,
    setShowCourseDetailModal,
}) => {
    return (
        <div>
            <h2>Available Courses</h2>
            <div className="courses-grid">
                {courses.map(course => {
                    const isEnrolled = myEnrollments.some((e: any) => e.courseId === course.id || e.course?.id === course.id);
                    return (
                        <div
                            key={course.id}
                            className="course-card"
                            onClick={() => { setSelectedCourse(course); setShowCourseDetailModal(true); }}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        >
                            <h3>{course.name}</h3>
                            <p>{course.description}</p>
                            <div className="price">${course.price}</div>
                            <button
                                onClick={(e) => { e.stopPropagation(); !isEnrolled && buyCourse(course.id) }}
                                disabled={isEnrolled}
                                className={`btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ marginTop: '10px', width: '100%', opacity: isEnrolled ? 0.7 : 1, cursor: isEnrolled ? 'default' : 'pointer' }}
                            >
                                {isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
