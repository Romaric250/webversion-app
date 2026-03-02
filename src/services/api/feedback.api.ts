import { apiClient } from './client'
import { API_BASE_URL } from '@/config/api'

export type FeedbackType = 'rating' | 'feature' | 'question' | 'general' | 'bug' | 'suggestion'

export const feedbackApi = {
  create: async (data: {
    type: FeedbackType
    category?: string
    rating?: number
    content?: string
    metadata?: Record<string, unknown>
    usageFrequency?: string
    device?: string
    experience?: string
    improvements?: string
    otherComments?: string
  }) => {
    const res = await apiClient.post<{ success: boolean }>(
      `${API_BASE_URL}/feedback`,
      data
    )
    if (!res.data.success) throw new Error('Failed to submit feedback')
  },
}
