'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { MessageSquare, Star, User, Mail } from 'lucide-react'

interface FeedbackMetadata {
  usageFrequency?: string | null
  device?: string | null
  experience?: string | null
  improvements?: string | null
  otherComments?: string | null
}

interface Feedback {
  id: string
  type: string
  category: string | null
  rating: number | null
  content: string | null
  metadata: FeedbackMetadata | null
  createdAt: string
  user: { id: string; name: string; email: string }
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [detailModal, setDetailModal] = useState<Feedback | null>(null)

  useEffect(() => {
    const url = typeFilter
      ? `${API_ENDPOINTS.ADMIN.FEEDBACK}?type=${typeFilter}`
      : API_ENDPOINTS.ADMIN.FEEDBACK
    apiClient
      .get<{ success: boolean; data: Feedback[] }>(url)
      .then((res) => {
        if (res.data.success) setFeedbacks(res.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Feedback</h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-background-secondary border border-background-tertiary text-white outline-none focus:border-primary/50"
        >
          <option value="">All types</option>
          <option value="rating">Rating</option>
          <option value="feature">Feature</option>
          <option value="question">Question</option>
          <option value="general">General</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6 sm:p-12 text-center">
          <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <button
              key={f.id}
              onClick={() => setDetailModal(f)}
              className="w-full text-left rounded-xl bg-background-secondary border border-background-tertiary p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{f.user.name}</p>
                    <p className="text-white/50 text-sm truncate">{f.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium">
                    {f.type}
                  </span>
                  {f.category && (
                    <span className="px-2.5 py-1 rounded-lg bg-background-tertiary text-white/70 text-xs">
                      {f.category}
                    </span>
                  )}
                  {f.rating != null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">
                      <Star className="h-3.5 w-3.5" />
                      {f.rating}/5
                    </span>
                  )}
                </div>
              </div>
              {f.content && (
                <p className="text-white/80 text-sm line-clamp-2">{f.content}</p>
              )}
              <p className="text-white/40 text-xs mt-2">
                {new Date(f.createdAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal ? `Feedback from ${detailModal.user.name}` : 'Feedback'}
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-tertiary">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">{detailModal.user.name}</p>
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {detailModal.user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium">
                {detailModal.type}
              </span>
              {detailModal.category && (
                <span className="px-2.5 py-1 rounded-lg bg-background-tertiary text-white/70 text-xs">
                  {detailModal.category}
                </span>
              )}
              {detailModal.rating != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">
                  <Star className="h-3.5 w-3.5" />
                  {detailModal.rating}/5
                </span>
              )}
            </div>
            {detailModal.content && (
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">Message</p>
                <p className="text-white/90 whitespace-pre-wrap">{detailModal.content}</p>
              </div>
            )}
            {detailModal.metadata && (
              <div className="space-y-3 pt-2 border-t border-background-tertiary">
                {(detailModal.metadata as FeedbackMetadata).experience && (
                  <div>
                    <p className="text-white/50 text-xs font-medium mb-0.5">Experience</p>
                    <p className="text-white/80 text-sm whitespace-pre-wrap">{(detailModal.metadata as FeedbackMetadata).experience}</p>
                  </div>
                )}
                {(detailModal.metadata as FeedbackMetadata).improvements && (
                  <div>
                    <p className="text-white/50 text-xs font-medium mb-0.5">Improvements</p>
                    <p className="text-white/80 text-sm whitespace-pre-wrap">{(detailModal.metadata as FeedbackMetadata).improvements}</p>
                  </div>
                )}
                {(detailModal.metadata as FeedbackMetadata).otherComments && (
                  <div>
                    <p className="text-white/50 text-xs font-medium mb-0.5">Other comments</p>
                    <p className="text-white/80 text-sm whitespace-pre-wrap">{(detailModal.metadata as FeedbackMetadata).otherComments}</p>
                  </div>
                )}
                {((detailModal.metadata as FeedbackMetadata).usageFrequency || (detailModal.metadata as FeedbackMetadata).device) && (
                  <div className="flex flex-wrap gap-2">
                    {(detailModal.metadata as FeedbackMetadata).usageFrequency && (
                      <span className="px-2 py-1 rounded bg-background-tertiary text-white/70 text-xs">
                        Usage: {(detailModal.metadata as FeedbackMetadata).usageFrequency}
                      </span>
                    )}
                    {(detailModal.metadata as FeedbackMetadata).device && (
                      <span className="px-2 py-1 rounded bg-background-tertiary text-white/70 text-xs">
                        Device: {(detailModal.metadata as FeedbackMetadata).device}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="text-white/40 text-xs pt-2">
              {new Date(detailModal.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
