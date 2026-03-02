'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Plus, BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  order: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchCourses = () => {
    apiClient
      .get<{ success: boolean; data: Course[] }>(API_ENDPOINTS.ADMIN.COURSES)
      .then((res) => {
        if (res.data.success) setCourses(res.data.data || [])
      })
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    setError(null)
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN.COURSES, {
        title,
        description: desc || null,
        thumbnailUrl: thumbnail || null,
      })
      setTitle('')
      setDesc('')
      setThumbnail('')
      setCreateModal(false)
      setSuccess('Course created')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Courses</h1>
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          Create course
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
      {success && <Toast message={success} type="success" onDismiss={() => setSuccess(null)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/admin/courses/${c.id}`}
              className="rounded-xl bg-background-secondary border border-background-tertiary p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-background-tertiary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-white/40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white group-hover:text-primary transition-colors truncate">
                    {c.title}
                  </p>
                  <p className="text-white/50 text-sm mt-0.5">
                    {c.isPublished ? 'Published' : 'Draft'}
                  </p>
                  {c.description && (
                    <p className="text-white/60 text-sm mt-2 line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create course"
      >
        <form onSubmit={createCourse} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50"
            />
          </div>
          <ImageUpload
            value={thumbnail}
            onChange={setThumbnail}
            label="Thumbnail (optional)"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
