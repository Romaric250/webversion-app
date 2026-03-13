'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, GripVertical, Pencil, Trash2, Users } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { VideoUpload } from '@/components/admin/VideoUpload'
import { LessonContentEditor } from '@/components/admin/LessonContentEditor'
import { QuizForm, type QuizContent } from '@/components/admin/QuizForm'
import { cn } from '@/lib/utils'

interface LessonLink {
  label: string
  url: string
}

interface Lesson {
  id: string
  title: string
  order: number
  content?: string | null
  videoUrl?: string | null
  imageUrl?: string | null
  links?: LessonLink[]
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

interface Enrollment {
  id: string
  enrolledAt: string
  completedAt: string | null
  user: { id: string; name: string; email: string; image?: string | null }
}

function SortableLessonRow({
  lesson,
  index,
  onEdit,
  onDelete,
}: {
  lesson: Lesson
  index: number
  onEdit: (l: Lesson) => void
  onDelete: (l: Lesson) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl bg-background-secondary border border-background-tertiary p-5 flex items-center gap-4 hover:border-background-tertiary/80 transition-colors',
        isDragging && 'opacity-50 shadow-lg z-10'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 -ml-1 rounded cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 flex-shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white truncate">{lesson.title}</p>
        {lesson.content && (
          <p className="text-white/50 text-sm truncate mt-0.5">
            {typeof lesson.content === 'string' && lesson.content.length > 80
              ? lesson.content.slice(0, 80) + '...'
              : lesson.content}
          </p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(lesson)}
          className="p-2 rounded-lg text-white/60 hover:text-primary hover:bg-primary/10"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(lesson)}
          className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
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
    imageUrl: '',
    links: [] as LessonLink[],
    quiz: null as QuizContent | null,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [reordering, setReordering] = useState(false)

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

  const fetchEnrollments = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Enrollment[] }>(
        API_ENDPOINTS.ADMIN.COURSE_ENROLLMENTS(id)
      )
      if (data.success) setEnrollments(data.data || [])
    } catch {
      setEnrollments([])
    }
  }, [id])

  useEffect(() => {
    fetchCourse()
  }, [id])

  useEffect(() => {
    if (course) fetchEnrollments()
  }, [course, fetchEnrollments])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !course) return

    const oldIndex = course.lessons.findIndex((l) => l.id === active.id)
    const newIndex = course.lessons.findIndex((l) => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(course.lessons.sort((a, b) => a.order - b.order), oldIndex, newIndex)
    setCourse((p) => (p ? { ...p, lessons: newOrder } : null))
    setReordering(true)
    setError(null)
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN.COURSE_LESSONS_REORDER(id), {
        lessonIds: newOrder.map((l) => l.id),
      })
      setSuccess('Order updated')
      setTimeout(() => setSuccess(null), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder')
      fetchCourse()
    } finally {
      setReordering(false)
    }
  }

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonForm.title.trim()) return
    setAddingLesson(true)
    setError(null)
    try {
      const quizContent = lessonForm.quiz?.questions?.length ? lessonForm.quiz : null
      await apiClient.post(API_ENDPOINTS.ADMIN.COURSE_LESSONS(id), {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        videoUrl: lessonForm.videoUrl || null,
        imageUrl: lessonForm.imageUrl || null,
        links: lessonForm.links.length ? lessonForm.links : null,
        order: course?.lessons.length ?? 0,
        quizContent,
      })
      setLessonForm({ title: '', content: '', videoUrl: '', imageUrl: '', links: [], quiz: null })
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
    const q = l.quizContent as QuizContent | null
    const links = Array.isArray(l.links) ? l.links : []
    setLessonForm({
      title: l.title,
      content: l.content || '',
      videoUrl: l.videoUrl || '',
      imageUrl: l.imageUrl || '',
      links,
      quiz: q?.questions?.length ? q : null,
    })
  }

  const updateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLessonModal) return
    setUpdatingLesson(true)
    setError(null)
    try {
      const quizContent = lessonForm.quiz?.questions?.length ? lessonForm.quiz : null
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.COURSE(id)}/lessons/${editLessonModal.id}`, {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        videoUrl: lessonForm.videoUrl || null,
        imageUrl: lessonForm.imageUrl || null,
        links: lessonForm.links,
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
        {course.lessons.length > 0 && (
          <p className="text-white/50 text-sm mb-2">Drag the grip handle to reorder</p>
        )}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={course.lessons.sort((a, b) => a.order - b.order).map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((l, idx) => (
                    <SortableLessonRow
                      key={l.id}
                      lesson={l}
                      index={idx}
                      onEdit={openEditLesson}
                      onDelete={setDeleteLessonModal}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Enrollments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Enrolled ({enrollments.length})
        </h2>
        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-background-tertiary p-8 text-center">
            <Users className="h-10 w-10 text-white/30 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No enrollments yet</p>
          </div>
        ) : (
          <div className="rounded-xl bg-background-secondary border border-background-tertiary overflow-hidden">
            <div className="divide-y divide-background-tertiary max-h-64 overflow-y-auto">
              {enrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-4 p-4 hover:bg-background-tertiary/30"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {e.user.image ? (
                      <img src={e.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary font-medium text-sm">
                        {e.user.name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{e.user.name}</p>
                    <p className="text-white/50 text-sm truncate">{e.user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/60 text-xs">
                      Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                    </p>
                    {e.completedAt && (
                      <p className="text-primary text-xs">Completed</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={addLessonModal}
        onClose={() => setAddLessonModal(false)}
        title="Add lesson"
        className="max-w-4xl max-h-[90vh]"
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
            <LessonContentEditor
              value={lessonForm.content}
              onChange={(v) => setLessonForm((p) => ({ ...p, content: v }))}
              placeholder="Lesson content or instructions. Select text for formatting options."
            />
          </div>
          <VideoUpload
            value={lessonForm.videoUrl}
            onChange={(url) => setLessonForm((p) => ({ ...p, videoUrl: url }))}
            label="Video (optional)"
          />
          <ImageUpload
            value={lessonForm.imageUrl}
            onChange={(url) => setLessonForm((p) => ({ ...p, imageUrl: url }))}
            label="Image / thumbnail (optional)"
          />
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Links (optional)</label>
            <div className="space-y-2">
              {lessonForm.links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={link.label}
                    onChange={(e) =>
                      setLessonForm((p) => ({
                        ...p,
                        links: p.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)),
                      }))
                    }
                    placeholder="Label"
                    className="flex-1 px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 text-sm"
                  />
                  <input
                    value={link.url}
                    onChange={(e) =>
                      setLessonForm((p) => ({
                        ...p,
                        links: p.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)),
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                    className="flex-1 px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLessonForm((p) => ({ ...p, links: p.links.filter((_, j) => j !== i) }))
                    }
                    className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setLessonForm((p) => ({ ...p, links: [...p.links, { label: '', url: '' }] }))
                }
                className="text-sm text-primary hover:underline"
              >
                + Add link
              </button>
            </div>
          </div>
          <div>
            <QuizForm
              value={lessonForm.quiz}
              onChange={(v) => setLessonForm((p) => ({ ...p, quiz: v }))}
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

      <Modal isOpen={!!editLessonModal} onClose={() => setEditLessonModal(null)} title="Edit lesson" className="max-w-4xl max-h-[90vh]">
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
              <LessonContentEditor
                value={lessonForm.content}
                onChange={(v) => setLessonForm((p) => ({ ...p, content: v }))}
                placeholder="Lesson content. Select text for formatting options."
              />
            </div>
            <VideoUpload value={lessonForm.videoUrl} onChange={(url) => setLessonForm((p) => ({ ...p, videoUrl: url }))} label="Video" />
            <ImageUpload value={lessonForm.imageUrl} onChange={(url) => setLessonForm((p) => ({ ...p, imageUrl: url }))} label="Image / thumbnail" />
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Links</label>
              <div className="space-y-2">
                {lessonForm.links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={link.label}
                      onChange={(e) =>
                        setLessonForm((p) => ({
                          ...p,
                          links: p.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)),
                        }))
                      }
                      placeholder="Label"
                      className="flex-1 px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 text-sm"
                    />
                    <input
                      value={link.url}
                      onChange={(e) =>
                        setLessonForm((p) => ({
                          ...p,
                          links: p.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)),
                        }))
                      }
                      placeholder="https://..."
                      type="url"
                      className="flex-1 px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLessonForm((p) => ({ ...p, links: p.links.filter((_, j) => j !== i) }))
                      }
                      className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setLessonForm((p) => ({ ...p, links: [...p.links, { label: '', url: '' }] }))
                  }
                  className="text-sm text-primary hover:underline"
                >
                  + Add link
                </button>
              </div>
            </div>
            <div>
              <QuizForm
                value={lessonForm.quiz}
                onChange={(v) => setLessonForm((p) => ({ ...p, quiz: v }))}
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
