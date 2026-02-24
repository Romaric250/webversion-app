import { apiClient } from './client'
import { API_BASE_URL } from '@/config/api'

export interface Lesson {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  order: number
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

export const learningApi = {
  getCourses: async (): Promise<Course[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: Course[] }>(
      `${API_BASE_URL}/learning/courses`
    )
    return data.success ? data.data || [] : []
  },
  getCourse: async (id: string): Promise<Course | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: Course }>(
      `${API_BASE_URL}/learning/courses/${id}`
    )
    return data.success ? data.data : null
  },
}
