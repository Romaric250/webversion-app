import { apiClient } from './client'
import { API_ENDPOINTS } from '@/config/api'

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
      API_ENDPOINTS.FEEDBACK,
      data
    )
    if (!res.data.success) throw new Error('Failed to submit feedback')
  },
}
