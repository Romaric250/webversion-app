import { apiClient } from './client'
import { API_ENDPOINTS } from '@/config/api'

export interface Lesson {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  imageUrl?: string | null
  order: number
  quizContent?: {
    questions?: Array<{
      id: string
      question: { text?: string; image?: string | null }
      options: Array<{ id: string; text?: string; image?: string | null; isCorrect: boolean }>
    }>
  } | null
}

export interface Course {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  order: number
  isPublished: boolean
  lessons: Lesson[]
}

export interface Enrollment {
  id: string
  courseId: string
  enrolledAt: string
  completedAt: string | null
  course: Course & { _count?: { lessons: number } }
  completedLessons: number
  totalLessons: number
}

export interface LessonProgress {
  completedAt: string | null
  quizScore: number | null
  quizPassed: boolean | null
}

export const learningApi = {
  getCourses: async (): Promise<Course[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: Course[] }>(
      API_ENDPOINTS.LEARNING.COURSES
    )
    return data.success ? data.data || [] : []
  },
  getCourse: async (id: string): Promise<Course | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: Course }>(
      API_ENDPOINTS.LEARNING.COURSE(id)
    )
    return data.success ? data.data : null
  },
  getLesson: async (courseId: string, lessonId: string): Promise<Lesson | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: Lesson }>(
      API_ENDPOINTS.LEARNING.LESSON(courseId, lessonId)
    )
    return data.success ? data.data : null
  },
  getEnrollments: async (): Promise<Enrollment[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: Enrollment[] }>(
      API_ENDPOINTS.LEARNING.ENROLLMENTS
    )
    return data.success ? data.data || [] : []
  },
  enroll: async (courseId: string): Promise<{ alreadyEnrolled?: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean; data: unknown; alreadyEnrolled?: boolean }>(
      API_ENDPOINTS.LEARNING.ENROLL(courseId)
    )
    return { alreadyEnrolled: data.alreadyEnrolled }
  },
  unenroll: async (courseId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.LEARNING.UNENROLL(courseId))
  },
  getEnrolledCourse: async (courseId: string): Promise<Course & { enrollment?: { enrolledAt: string; completedAt: string | null }; lessonProgress?: Record<string, LessonProgress> } | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: Course & { enrollment?: { enrolledAt: string; completedAt: string | null }; lessonProgress?: Record<string, LessonProgress> } }>(
      API_ENDPOINTS.LEARNING.MY_COURSE(courseId)
    )
    return data.success ? data.data : null
  },
  completeLesson: async (lessonId: string, quizAnswers?: Array<{ questionId: string; optionId: string }>): Promise<LessonProgress> => {
    const { data } = await apiClient.post<{ success: boolean; data: LessonProgress }>(
      API_ENDPOINTS.LEARNING.LESSON_COMPLETE(lessonId),
      { quizAnswers }
    )
    return data.data!
  },
  getLessonProgress: async (lessonId: string): Promise<LessonProgress | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: LessonProgress }>(
      API_ENDPOINTS.LEARNING.LESSON_PROGRESS(lessonId)
    )
    return data.success ? data.data : null
  },
}
