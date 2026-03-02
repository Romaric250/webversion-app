'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Play, Loader2, LogOut } from 'lucide-react'
import { learningApi, type Course, type LessonProgress } from '@/services/api/learning.api'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'

export default function LearningDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolledCourse, setEnrolledCourse] = useState<Course & { enrollment?: { enrolledAt: string; completedAt: string | null }; lessonProgress?: Record<string, LessonProgress> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [enrollModal, setEnrollModal] = useState(false)
  const [unenrollModal, setUnenrollModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    learningApi.getEnrolledCourse(id)
      .then((c) => {
        setEnrolledCourse(c)
        setCourse(c)
      })
      .catch(() => learningApi.getCourse(id).then((c) => {
        setCourse(c || null)
        setEnrolledCourse(null)
      }))
      .catch(() => router.replace('/app/learning'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleEnroll = async () => {
    setEnrolling(true)
    setError(null)
    try {
      await learningApi.enroll(id)
      const c = await learningApi.getEnrolledCourse(id)
      setEnrolledCourse(c || null)
      setCourse(c || null)
      setEnrollModal(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    setUnenrolling(true)
    setError(null)
    try {
      await learningApi.unenroll(id)
      const c = await learningApi.getCourse(id)
      setCourse(c || null)
      setEnrolledCourse(null)
      setUnenrollModal(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unenroll')
    } finally {
      setUnenrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  const displayCourse = enrolledCourse || course
  if (!displayCourse) return null

  const lessons = displayCourse.lessons || []
  const progress = enrolledCourse?.lessonProgress || {}
  const isEnrolled = !!enrolledCourse

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/learning" className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title">{displayCourse.title}</h1>
          <p className="page-subtitle">{lessons.length} lessons</p>
        </div>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}

      {!isEnrolled && (
        <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6 mb-8">
          <p className="text-white/80 mb-4">Enroll in this course to access lessons and track your progress.</p>
          <button
            onClick={() => setEnrollModal(true)}
            className="px-6 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
          >
            Enroll now
          </button>
        </div>
      )}

      {isEnrolled && (
        <div className="mb-6">
          <button
            onClick={() => setUnenrollModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Unenroll from course
          </button>
        </div>
      )}

      <Modal isOpen={enrollModal} onClose={() => setEnrollModal(false)} title="Enroll in course">
        <div className="space-y-4">
          <p className="text-white/80">
            Enroll in <strong className="text-white">{displayCourse.title}</strong> to access all lessons and track your progress.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEnrollModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {enrolling ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Enrolling...</> : 'Enroll'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={unenrollModal} onClose={() => setUnenrollModal(false)} title="Unenroll from course">
        <div className="space-y-4">
          <p className="text-white/80">
            Unenroll from <strong className="text-white">{displayCourse.title}</strong>? Your progress will be lost and you will need to re-enroll to access lessons.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUnenrollModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUnenroll}
              disabled={unenrolling}
              className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {unenrolling ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Unenrolling...</> : 'Unenroll'}
            </button>
          </div>
        </div>
      </Modal>

      <div className="max-w-2xl space-y-3">
        {lessons.map((lesson, index) => {
          const prog = progress[lesson.id]
          const completed = prog?.completedAt != null
          return (
            <Link
              key={lesson.id}
              href={isEnrolled ? `/app/learning/${id}/lesson/${lesson.id}` : '#'}
              className={`card w-full flex items-center gap-4 p-4 text-left group ${isEnrolled ? 'card-hover' : 'opacity-60 cursor-not-allowed'}`}
              onClick={(e) => !isEnrolled && e.preventDefault()}
            >
              <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0">
                {completed ? (
                  <CheckCircle className="h-6 w-6 text-primary" />
                ) : (
                  <span className="text-white/60 text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{lesson.title}</p>
                <p className="text-white/50 text-sm">
                  {completed ? (prog?.quizScore != null ? `Quiz: ${Math.round(prog.quizScore)}%` : 'Completed') : 'Not started'}
                </p>
              </div>
              {isEnrolled && <Play className="h-5 w-5 text-white/40 group-hover:text-primary flex-shrink-0 transition-colors" />}
            </Link>
          )
        })}
      </div>

      {lessons.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-white/60">No lessons in this course yet</p>
        </div>
      )}
    </>
  )
}
