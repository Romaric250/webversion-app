'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Play, Loader2 } from 'lucide-react'
import { learningApi, type Course } from '@/services/api/learning.api'
import { useState, useEffect } from 'react'

export default function LearningDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    learningApi.getCourse(id).then((c) => {
      setCourse(c || null)
      if (!c) router.replace('/app/learning')
    }).catch(() => router.replace('/app/learning')).finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!course) return null

  const lessons = course.lessons || []

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/learning" className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">{lessons.length} lessons</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-3">
        {lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/app/learning/${id}/lesson/${lesson.id}`}
            className="card card-hover w-full flex items-center gap-4 p-4 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0">
              <span className="text-white/60 text-sm font-medium">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{lesson.title}</p>
              <p className="text-white/50 text-sm">Not started</p>
            </div>
            <Play className="h-5 w-5 text-white/40 group-hover:text-primary flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-white/60">No lessons in this course yet</p>
        </div>
      )}
    </>
  )
}
