'use client'

import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

const courses = [
  { id: 1, title: 'Basic Greetings', description: 'Learn hello, goodbye, and introductions', lessons: 5, progress: 35, color: 'from-primary/20 to-primary/5' },
  { id: 2, title: 'ASL Fundamentals', description: 'Master the basics of sign language', lessons: 12, progress: 0, color: 'from-blue-900/30 to-blue-950/10' },
  { id: 3, title: 'Numbers & Counting', description: 'Learn to count and use numbers', lessons: 5, progress: 0, color: 'from-violet-900/30 to-violet-950/10' },
]

export default function LearningPage() {
  return (
    <>
      <PageHeader title="Learning Hub" subtitle="Interactive lessons to build your sign language skills" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/app/learning/${course.id}`}
            className="card card-hover overflow-hidden group"
          >
            <div className={`p-4 bg-gradient-to-br ${course.color}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{course.title}</h2>
                    <p className="text-white/60 text-sm mt-0.5">{course.description}</p>
                    <p className="text-white/50 text-xs mt-1">{course.lessons} lessons</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-primary flex-shrink-0 transition-colors" />
              </div>
              {course.progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Progress</span>
                    <span className="text-primary font-bold">{course.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-background-tertiary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
