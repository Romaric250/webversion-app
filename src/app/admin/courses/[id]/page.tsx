'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { API_BASE_URL } from '@/config/api'

interface Lesson {
  id: string
  title: string
  order: number
}

interface Course {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  lessons: Lesson[]
}

export default function AdminCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingLesson, setAddingLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonVideo, setLessonVideo] = useState('')

  const fetchCourse = async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Course[] }>(`${API_BASE_URL}/admin/courses`)
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
    if (!lessonTitle.trim()) return
    setAddingLesson(true)
    try {
      await apiClient.post(`${API_BASE_URL}/admin/courses/${id}/lessons`, {
        title: lessonTitle,
        content: lessonContent || null,
        videoUrl: lessonVideo || null,
      })
      setLessonTitle('')
      setLessonContent('')
      setLessonVideo('')
      fetchCourse()
    } catch {
      // error
    } finally {
      setAddingLesson(false)
    }
  }

  const togglePublish = async () => {
    try {
      await apiClient.patch(`${API_BASE_URL}/admin/courses/${id}`, {
        isPublished: !course?.isPublished,
      })
      setCourse((p) => (p ? { ...p, isPublished: !p.isPublished } : null))
    } catch {
      // error
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
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/courses" className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <p className="text-white/50 text-sm">{course.isPublished ? 'Published' : 'Draft'}</p>
        </div>
        <button
          onClick={togglePublish}
          className="ml-auto px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
        >
          {course.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Add lesson</h2>
        <form onSubmit={addLesson} className="space-y-4">
          <input
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Lesson title"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40"
            required
          />
          <textarea
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            placeholder="Content (optional)"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none"
          />
          <input
            value={lessonVideo}
            onChange={(e) => setLessonVideo(e.target.value)}
            placeholder="Video URL (optional)"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40"
          />
          <button
            type="submit"
            disabled={addingLesson}
            className="px-5 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {addingLesson ? 'Adding...' : 'Add lesson'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-white mb-4">Lessons ({course.lessons.length})</h2>
        <div className="space-y-2">
          {course.lessons.map((l) => (
            <div key={l.id} className="card p-4 flex items-center justify-between">
              <p className="font-medium text-white">{l.title}</p>
              <span className="text-white/50 text-sm">Order: {l.order}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
