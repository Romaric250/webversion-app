'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Lesson {
  id: string
  title: string
  order: number
  content?: string | null
  videoUrl?: string | null
  imageUrl?: string | null
  quizContent?: unknown
}

interface Course {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  lessons: Lesson[]
}

export default function AdminCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [addLessonModal, setAddLessonModal] = useState(false)
  const [editLessonModal, setEditLessonModal] = useState<Lesson | null>(null)
  const [deleteLessonModal, setDeleteLessonModal] = useState<Lesson | null>(null)
  const [addingLesson, setAddingLesson] = useState(false)
  const [updatingLesson, setUpdatingLesson] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState(false)
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    quiz: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchCourse = async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Course[] }>(
        API_ENDPOINTS.ADMIN.COURSES
      )
      const c = data.data?.find((x) => x.id === id)
      if (c) setCourse(c)
      else router.replace('/admin/courses')
    } catch {
      router.replace('/admin/courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonForm.title.trim()) return
    setAddingLesson(true)
    setError(null)
    try {
      let quizContent: unknown = null
      if (lessonForm.quiz.trim()) {
        try {
          quizContent = JSON.parse(lessonForm.quiz.trim())
        } catch {
          setError('Quiz must be valid JSON. Example: {"questions":[{"id":"q1","question":{"text":"What is..."},"options":[{"id":"a1","text":"A","isCorrect":true},{"id":"a2","text":"B","isCorrect":false}]}]}')
          setAddingLesson(false)
          return
        }
      }
      await apiClient.post(API_ENDPOINTS.ADMIN.COURSE_LESSONS(id), {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        videoUrl: lessonForm.videoUrl || null,
        imageUrl: lessonForm.videoUrl || null,
        order: course?.lessons.length ?? 0,
        quizContent,
      })
      setLessonForm({ title: '', content: '', videoUrl: '', quiz: '' })
      setAddLessonModal(false)
      setSuccess('Lesson added')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourse()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add lesson')
    } finally {
      setAddingLesson(false)
    }
  }

  const openEditLesson = (l: Lesson) => {
    setEditLessonModal(l)
    setLessonForm({
      title: l.title,
      content: l.content || '',
      videoUrl: l.imageUrl || l.videoUrl || '',
      quiz: l.quizContent ? JSON.stringify(l.quizContent, null, 2) : '',
    })
  }

  const updateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLessonModal) return
    setUpdatingLesson(true)
    setError(null)
    try {
      let quizContent: unknown = null
      if (lessonForm.quiz.trim()) {
        try {
          quizContent = JSON.parse(lessonForm.quiz.trim())
        } catch {
          setError('Quiz must be valid JSON')
          setUpdatingLesson(false)
          return
        }
      }
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.COURSE(id)}/lessons/${editLessonModal.id}`, {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        videoUrl: lessonForm.videoUrl || null,
        imageUrl: lessonForm.videoUrl || null,
        quizContent,
      })
      setEditLessonModal(null)
      setSuccess('Lesson updated')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourse()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setUpdatingLesson(false)
    }
  }

  const deleteLesson = async () => {
    if (!deleteLessonModal) return
    setDeletingLesson(true)
    setError(null)
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.COURSE(id)}/lessons/${deleteLessonModal.id}`)
      setDeleteLessonModal(null)
      setSuccess('Lesson deleted')
      setTimeout(() => setSuccess(null), 3000)
      fetchCourse()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeletingLesson(false)
    }
  }

  const togglePublish = async () => {
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN.COURSE(id), {
        isPublished: !course?.isPublished,
      })
      setCourse((p) => (p ? { ...p, isPublished: !p.isPublished } : null))
    } catch {
      setError('Failed to update')
    }
  }

  if (loading || !course) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-background-tertiary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-7 w-7 text-white/40" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white truncate">{course.title}</h1>
            <p className="text-white/50 text-sm">
              {course.isPublished ? 'Published' : 'Draft'} · {course.lessons.length} lessons
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setAddLessonModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
            >
              <Plus className="h-5 w-5" />
              Add lesson
            </button>
            <button
              onClick={togglePublish}
              className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated font-medium"
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
      {success && <Toast message={success} type="success" onDismiss={() => setSuccess(null)} />}

      {course.description && (
        <div className="rounded-xl bg-background-secondary border border-background-tertiary p-5">
          <p className="text-white/80 text-sm">{course.description}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Lessons</h2>
        {course.lessons.length === 0 ? (
          <div
            onClick={() => setAddLessonModal(true)}
            className="rounded-xl border-2 border-dashed border-background-tertiary p-12 text-center hover:border-primary/30 cursor-pointer transition-colors"
          >
            <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 mb-1">No lessons yet</p>
            <p className="text-white/40 text-sm">Click to add your first lesson</p>
          </div>
        ) : (
          <div className="space-y-2">
            {course.lessons
              .sort((a, b) => a.order - b.order)
              .map((l, idx) => (
                <div
                  key={l.id}
                  className="rounded-xl bg-background-secondary border border-background-tertiary p-5 flex items-center gap-4 hover:border-background-tertiary/80 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-white/30 flex-shrink-0" />
                  <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{l.title}</p>
                    {l.content && (
                      <p className="text-white/50 text-sm truncate mt-0.5">
                        {typeof l.content === 'string' && l.content.length > 80
                          ? l.content.slice(0, 80) + '...'
                          : l.content}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditLesson(l)}
                      className="p-2 rounded-lg text-white/60 hover:text-primary hover:bg-primary/10"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteLessonModal(l)}
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
      </div>

      <Modal
        isOpen={addLessonModal}
        onClose={() => setAddLessonModal(false)}
        title="Add lesson"
        className="max-w-lg"
      >
        <form onSubmit={addLesson} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
            <input
              value={lessonForm.title}
              onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Lesson title"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Content (optional)</label>
            <textarea
              value={lessonForm.content}
              onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Lesson content or instructions"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50"
            />
          </div>
          <ImageUpload
            value={lessonForm.videoUrl}
            onChange={(url) => setLessonForm((p) => ({ ...p, videoUrl: url }))}
            label="Image / thumbnail (optional)"
          />
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Quiz - MCQ JSON (optional)</label>
            <textarea
              value={lessonForm.quiz}
              onChange={(e) => setLessonForm((p) => ({ ...p, quiz: e.target.value }))}
              placeholder='{"questions":[{"id":"q1","question":{"text":"Question?","image":null},"options":[{"id":"a1","text":"A","image":null,"isCorrect":true},{"id":"a2","text":"B","image":null,"isCorrect":false}]}]}'
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50 font-mono text-xs"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddLessonModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingLesson}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {addingLesson ? 'Adding...' : 'Add lesson'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editLessonModal} onClose={() => setEditLessonModal(null)} title="Edit lesson" className="max-w-lg">
        {editLessonModal && (
          <form onSubmit={updateLesson} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
              <input
                value={lessonForm.title}
                onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Content</label>
              <textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white resize-none outline-none focus:border-primary/50"
              />
            </div>
            <ImageUpload value={lessonForm.videoUrl} onChange={(url) => setLessonForm((p) => ({ ...p, videoUrl: url }))} label="Image / thumbnail" />
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Quiz (MCQ JSON)</label>
              <textarea
                value={lessonForm.quiz}
                onChange={(e) => setLessonForm((p) => ({ ...p, quiz: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white font-mono text-xs resize-none outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditLessonModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="submit" disabled={updatingLesson} className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50">
                {updatingLesson ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteLessonModal} onClose={() => setDeleteLessonModal(null)} title="Delete lesson">
        {deleteLessonModal && (
          <div className="space-y-4">
            <p className="text-white/80">
              Delete <strong className="text-white">{deleteLessonModal.title}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeleteLessonModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="button" onClick={deleteLesson} disabled={deletingLesson} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                {deletingLesson ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
