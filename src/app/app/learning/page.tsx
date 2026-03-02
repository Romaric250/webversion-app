'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight, Flame, Trophy, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { learningApi, type Course, type Enrollment } from '@/services/api/learning.api'

const gradients = ['from-emerald-600/30 via-primary/20 to-transparent', 'from-blue-600/30 via-indigo-500/20 to-transparent', 'from-violet-600/30 via-purple-500/20 to-transparent']
const icons = ['👋', '🤟', '🔢']

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      learningApi.getCourses(),
      learningApi.getEnrollments().catch(() => []),
    ]).then(([c, e]) => {
      setCourses(c)
      setEnrollments(e)
    }).finally(() => setLoading(false))
  }, [])

  const totalLessons = courses.reduce((a, c) => a + (c.lessons?.length || 0), 0)
  const completedLessons = enrollments.reduce((a, e) => a + (e.completedLessons || 0), 0)
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Learning Hub" subtitle="Interactive lessons to build your sign language skills" />

      {/* Stats banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-white/60 text-xs">Day streak</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{overallProgress}%</p>
            <p className="text-white/60 text-xs">Overall</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{completedLessons}/{totalLessons}</p>
            <p className="text-white/60 text-xs">Lessons done</p>
          </div>
        </div>
      </div>

      {enrollments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">My courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((e, i) => {
              const pct = e.totalLessons > 0 ? Math.round((e.completedLessons / e.totalLessons) * 100) : 0
              return (
                <Link key={e.id} href={`/app/learning/${e.courseId}`} className="card card-hover overflow-hidden group block">
                  <div className={`relative p-6 bg-gradient-to-br ${gradients[i % gradients.length]} min-h-[180px] flex flex-col`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {e.course.thumbnailUrl ? <img src={e.course.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : icons[i % icons.length]}
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div className="mt-4 flex-1">
                      <h3 className="font-bold text-white text-lg">{e.course.title}</h3>
                      <p className="text-white/60 text-sm mt-1">{e.course.description || ''}</p>
                      <p className="text-white/50 text-xs mt-2">{e.completedLessons} of {e.totalLessons} lessons</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${pct} 100`} strokeLinecap="round" className="text-primary" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{pct}%</span>
                      </div>
                      <span className="text-white/60 text-sm">{e.completedLessons} of {e.totalLessons} completed</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">All courses</h2>
        {courses.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/80 font-medium">No courses yet</p>
            <p className="text-white/50 text-sm mt-1">Admin can add courses in the admin dashboard</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => {
              const enrolled = enrollments.find((e) => e.courseId === course.id)
              const pct = enrolled && enrolled.totalLessons > 0 ? Math.round((enrolled.completedLessons / enrolled.totalLessons) * 100) : 0
              return (
                <Link key={course.id} href={`/app/learning/${course.id}`} className="card card-hover overflow-hidden group block">
                  <div className={`relative p-6 bg-gradient-to-br ${gradients[i % gradients.length]} min-h-[180px] flex flex-col`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : icons[i % icons.length]}
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div className="mt-4 flex-1">
                      <h3 className="font-bold text-white text-lg">{course.title}</h3>
                      <p className="text-white/60 text-sm mt-1">{course.description || ''}</p>
                      <p className="text-white/50 text-xs mt-2">{course.lessons?.length || 0} lessons</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${pct} 100`} strokeLinecap="round" className="text-primary" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{pct}%</span>
                      </div>
                      <span className="text-white/60 text-sm">
                        {enrolled ? `${enrolled.completedLessons} of ${course.lessons?.length || 0} completed` : 'Enroll to start'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
