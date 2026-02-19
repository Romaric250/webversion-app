'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

const courseData: Record<string, { title: string; lessons: { id: string; title: string; done?: boolean }[] }> = {
  '1': {
    title: 'Basic Greetings',
    lessons: [
      { id: '1', title: 'Hello and Hi', done: true },
      { id: '2', title: 'Goodbye and See you', done: true },
      { id: '3', title: 'Nice to meet you', done: false },
      { id: '4', title: 'How are you?', done: false },
      { id: '5', title: 'Introducing yourself', done: false },
    ],
  },
  '2': {
    title: 'ASL Fundamentals',
    lessons: [
      { id: '1', title: 'The alphabet A–M', done: false },
      { id: '2', title: 'The alphabet N–Z', done: false },
      { id: '3', title: 'Fingerspelling basics', done: false },
      { id: '4', title: 'Numbers 0–9', done: false },
      { id: '5', title: 'Numbers 10–20', done: false },
      { id: '6', title: 'Common handshapes', done: false },
    ],
  },
  '3': {
    title: 'Numbers & Counting',
    lessons: [
      { id: '1', title: 'Counting 1–10', done: false },
      { id: '2', title: 'Counting 11–20', done: false },
      { id: '3', title: 'Counting by tens', done: false },
      { id: '4', title: 'Ordinal numbers', done: false },
      { id: '5', title: 'Using numbers in sentences', done: false },
    ],
  },
}

export default function LearningDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const course = courseData[id]

  if (!course) {
    router.replace('/app/learning')
    return null
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/app/learning"
          className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={course.title} subtitle={`${course.lessons.length} lessons`} />
      </div>

      <div className="max-w-2xl space-y-3">
        {course.lessons.map((lesson, index) => (
          <button
            key={lesson.id}
            onClick={() => {}}
            className="card card-hover w-full flex items-center gap-4 p-4 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0">
              {lesson.done ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <span className="text-white/60 text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{lesson.title}</p>
              <p className="text-white/50 text-sm">{lesson.done ? 'Completed' : 'Not started'}</p>
            </div>
            <Play className="h-5 w-5 text-white/40 group-hover:text-primary flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </>
  )
}
