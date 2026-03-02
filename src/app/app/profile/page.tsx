'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Save, Loader2, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toast } from '@/components/ui/Toast'
import { userApi } from '@/services/api/user.api'
import { FeedbackModal } from '@/components/ui/FeedbackModal'

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('feedback') === '1') {
      setFeedbackOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!name.trim() || name === user?.name) return
    try {
      setSaving(true)
      setError(null)
      const updated = await userApi.updateProfile({ name: name.trim() })
      setUser({ ...user!, ...updated })
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="max-w-xl space-y-6">
        {error && (
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        )}
        {success && (
          <Toast message={success} type="success" onDismiss={() => setSuccess(null)} />
        )}

        <div className="card overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <p className="text-white/60 text-sm mb-1">Email</p>
                <p className="text-white font-medium mb-4">{user?.email || ''}</p>

                <label className="block text-white/60 text-sm mb-2 text-left">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 mb-4"
                />

                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || name === user?.name}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Your feedback helps us improve SignNova. Share your thoughts, report bugs, or suggest new features.
          </p>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark transition-colors"
          >
            Give feedback
          </button>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4">Account</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-background-tertiary">
              <span className="text-white/60">Plan</span>
              <span className="text-white">Free</span>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
