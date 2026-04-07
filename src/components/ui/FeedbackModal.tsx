'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { feedbackApi } from '@/services/api/feedback.api'
import { MessageSquare } from 'lucide-react'

const FEEDBACK_TYPES = [
  { value: 'general', label: 'General feedback' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'question', label: 'Question' },
  { value: 'rating', label: 'Rating' },
] as const

const CATEGORIES = [
  { value: '', label: 'Select area...' },
  { value: 'transcripts', label: 'Transcripts' },
  { value: 'groups', label: 'Groups' },
  { value: 'chats', label: 'Chats' },
  { value: 'learning', label: 'Learning' },
  { value: 'dictionary', label: 'Dictionary' },
  { value: 'notes', label: 'Notes' },
  { value: 'sign-to-text', label: 'Sign to Text' },
  { value: 'profile', label: 'Profile / Account' },
  { value: 'navigation', label: 'Navigation / Usability' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
] as const

const USAGE_FREQUENCY = [
  { value: '', label: 'How often do you use SignNova?' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'first-time', label: 'First time' },
] as const

const DEVICES = [
  { value: '', label: 'What device do you use?' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'both', label: 'Both desktop and mobile' },
] as const

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<string>('general')
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState(0)
  const [usageFrequency, setUsageFrequency] = useState('')
  const [device, setDevice] = useState('')
  const [experience, setExperience] = useState('')
  const [improvements, setImprovements] = useState('')
  const [otherComments, setOtherComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await feedbackApi.create({
        type: type as any,
        category: category || undefined,
        rating: type === 'rating' ? rating : undefined,
        content: [experience, improvements, otherComments].filter(Boolean).join('\n\n') || undefined,
        usageFrequency: usageFrequency || undefined,
        device: device || undefined,
        experience: experience || undefined,
        improvements: improvements || undefined,
        otherComments: otherComments || undefined,
      })
      setDone(true)
      setType('general')
      setCategory('')
      setRating(0)
      setUsageFrequency('')
      setDevice('')
      setExperience('')
      setImprovements('')
      setOtherComments('')
      setTimeout(() => {
        setDone(false)
        onClose()
      }, 2000)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Feedback" className="max-w-lg w-full">
      <div className="space-y-3 sm:space-y-4">
        <p className="text-white/60 text-sm">
          Your feedback helps us improve SignNova. Please take a moment to share your thoughts.
        </p>

        {done ? (
          <div className="py-6 sm:py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <p className="text-primary font-medium">Thank you for your feedback!</p>
            <p className="text-white/60 text-sm mt-1">We appreciate you taking the time to help us improve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">Type of feedback</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base outline-none focus:border-primary/50"
              >
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {type === 'rating' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">Overall rating (1-5)</label>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors flex-shrink-0 ${
                        rating >= n ? 'bg-primary text-background' : 'bg-background-tertiary text-white/60 hover:bg-background-elevated'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">Area / Feature</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base outline-none focus:border-primary/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value || 'empty'} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">How often do you use SignNova?</label>
              <select
                value={usageFrequency}
                onChange={(e) => setUsageFrequency(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base outline-none focus:border-primary/50"
              >
                {USAGE_FREQUENCY.map((u) => (
                  <option key={u.value || 'empty'} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">What device do you use?</label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base outline-none focus:border-primary/50"
              >
                {DEVICES.map((d) => (
                  <option key={d.value || 'empty'} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">Describe your experience</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="What did you like or dislike? What worked well?"
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base placeholder:text-white/40 outline-none focus:border-primary/50 resize-none min-h-0"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">What would you like to see improved?</label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Suggestions for new features or changes..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base placeholder:text-white/40 outline-none focus:border-primary/50 resize-none min-h-0"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5 sm:mb-2">Any other comments?</label>
              <textarea
                value={otherComments}
                onChange={(e) => setOtherComments(e.target.value)}
                placeholder="Additional thoughts or feedback..."
                rows={2}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white text-sm sm:text-base placeholder:text-white/40 outline-none focus:border-primary/50 resize-none min-h-0"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || (type === 'rating' && rating === 0)}
                className="flex-1 py-3 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 text-sm sm:text-base"
              >
                {submitting ? 'Submitting...' : 'Submit feedback'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
