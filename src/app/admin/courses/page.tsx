'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Plus, BookOpen, Pencil, Trash2 } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  ashesiOnly?: boolean
  order: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<Course | null>(null)
  const [deleteModal, setDeleteModal] = useState<Course | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [createAshesiOnly, setCreateAshesiOnly] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', desc: '', thumbnail: '', isPublished: false, ashesiOnly: false })
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
        ashesiOnly: createAshesiOnly,
      })
      setTitle('')
      setDesc('')
      setThumbnail('')
      setCreateAshesiOnly(false)
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

  const openEditModal = (c: Course) => {
    setEditModal(c)
    setEditForm({
      title: c.title,
      desc: c.description || '',
      thumbnail: c.thumbnailUrl || '',
      isPublished: c.isPublished,
      ashesiOnly: c.ashesiOnly ?? false,
    })
  }

  const updateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    setUpdating(true)
    setError(null)
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN.COURSE(editModal.id), {
        title: editForm.title.trim(),
        description: editForm.desc.trim() || null,
        thumbnailUrl: editForm.thumbnail || null,
        isPublished: editForm.isPublished,
        ashesiOnly: editForm.ashesiOnly,
      })
      setEditModal(null)
      setSuccess('Course updated')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const deleteCourse = async () => {
    if (!deleteModal) return
    setDeleting(true)
    setError(null)
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.COURSE(deleteModal.id))
      setDeleteModal(null)
      setSuccess('Course deleted')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeleting(false)
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
            <div
              key={c.id}
              className="rounded-xl bg-background-secondary border border-background-tertiary p-5 hover:border-primary/30 transition-colors group relative"
            >
              <Link href={`/admin/courses/${c.id}`} className="block">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-background-tertiary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {c.thumbnailUrl ? (
                      <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
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
              <div className="flex gap-1 mt-3 pt-3 border-t border-background-tertiary">
                <button
                  onClick={(e) => { e.preventDefault(); openEditModal(c) }}
                  className="p-2 rounded-lg text-white/60 hover:text-primary hover:bg-primary/10"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteModal(c) }}
                  className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
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
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createAshesiOnly}
                onChange={(e) => setCreateAshesiOnly(e.target.checked)}
                className="rounded border-background-tertiary bg-background-tertiary text-primary focus:ring-primary"
              />
              <span className="text-white/80 text-sm">Ashesi students only</span>
            </label>
            <span className="text-white/50 text-xs">(@ashesi.edu.gh emails)</span>
          </div>
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

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit course" className="max-w-md">
        {editModal && (
          <form onSubmit={updateCourse} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
              <textarea
                value={editForm.desc}
                onChange={(e) => setEditForm((p) => ({ ...p, desc: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white resize-none outline-none focus:border-primary/50"
              />
            </div>
            <ImageUpload value={editForm.thumbnail} onChange={(url) => setEditForm((p) => ({ ...p, thumbnail: url }))} label="Thumbnail" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.ashesiOnly}
                  onChange={(e) => setEditForm((p) => ({ ...p, ashesiOnly: e.target.checked }))}
                  className="rounded border-background-tertiary bg-background-tertiary text-primary focus:ring-primary"
                />
                <span className="text-white/80 text-sm">Ashesi students only</span>
              </label>
              <span className="text-white/50 text-xs">(@ashesi.edu.gh emails)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editPublished"
                checked={editForm.isPublished}
                onChange={(e) => setEditForm((p) => ({ ...p, isPublished: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="editPublished" className="text-white/80 text-sm">Published (visible for enrollment)</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="submit" disabled={updating} className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50">
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete course">
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-white/80">
              Delete <strong className="text-white">{deleteModal.title}</strong>? All lessons will be removed. This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="button" onClick={deleteCourse} disabled={deleting} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
