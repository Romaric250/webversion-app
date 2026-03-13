'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { learningApi, type Lesson } from '@/services/api/learning.api'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/ui/Toast'
import { LessonContentRenderer } from '@/components/learning/LessonContentRenderer'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params.id)
  const lessonId = String(params.lessonId)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<{ completedAt: string | null; quizScore: number | null; quizPassed: boolean | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      learningApi.getLesson(courseId, lessonId),
      learningApi.getLessonProgress(lessonId),
    ])
      .then(([l, p]) => {
        setLesson(l || null)
        setProgress(p || null)
        if (!l) router.replace(`/app/learning/${courseId}`)
      })
      .catch(() => router.replace(`/app/learning/${courseId}`))
      .finally(() => setLoading(false))
  }, [courseId, lessonId, router])

  const handleComplete = async () => {
    if (!lesson) return
    const quizContent = lesson.quizContent as { questions?: Array<{ id: string }> } | null
    const hasQuiz = quizContent?.questions && quizContent.questions.length > 0

    if (hasQuiz) {
      const answers = Object.entries(quizAnswers).map(([questionId, optionId]) => ({ questionId, optionId }))
      const allAnswered = quizContent!.questions!.every((q) => quizAnswers[q.id])
      if (!allAnswered) {
        setError('Please answer all questions')
        return
      }
      setSubmitting(true)
      setError(null)
      try {
        const result = await learningApi.completeLesson(lessonId, answers)
        setProgress(result)
        if (result.quizPassed) {
          setSuccess('Quiz passed! Lesson completed.')
        } else {
          setError(`Quiz score: ${Math.round(result.quizScore || 0)}%. You need 50% or more to pass.`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to submit')
      } finally {
        setSubmitting(false)
      }
    } else {
      setSubmitting(true)
      setError(null)
      try {
        const result = await learningApi.completeLesson(lessonId)
        setProgress(result)
        setSuccess('Lesson completed!')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to complete')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading || !lesson) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  const quizContent = lesson.quizContent as { questions?: Array<{ id: string; question: { text?: string; image?: string | null }; options: Array<{ id: string; text?: string; image?: string | null; isCorrect: boolean }> }> } | null
  const hasQuiz = quizContent?.questions && quizContent.questions.length > 0
  const completed = progress?.completedAt != null

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href={`/app/learning/${courseId}`}
          className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title">{lesson.title}</h1>
          <p className="page-subtitle">{completed ? 'Completed' : 'In progress'}</p>
        </div>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
      {success && <Toast message={success} type="success" onDismiss={() => setSuccess(null)} />}

      <div className="space-y-6">
        {lesson.content && (
          <div className="rounded-xl bg-background-secondary border border-background-tertiary p-4 sm:p-6">
            <LessonContentRenderer content={lesson.content} />
          </div>
        )}

        {lesson.videoUrl && (
          <div className="rounded-xl overflow-hidden bg-background-tertiary">
            <video src={lesson.videoUrl} controls className="w-full aspect-video object-contain" playsInline />
          </div>
        )}

        {lesson.imageUrl && (
          <div className="rounded-xl overflow-hidden bg-background-tertiary">
            <img src={lesson.imageUrl} alt="" className="w-full max-h-[50vh] object-contain" />
          </div>
        )}

        {Array.isArray(lesson.links) && lesson.links.length > 0 && (
          <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Resources</h2>
            <ul className="space-y-2">
              {lesson.links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasQuiz && !completed && (
          <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Quiz</h2>
            {quizContent!.questions!.map((q) => (
              <div key={q.id} className="space-y-3">
                <p className="text-white/90 font-medium">
                  {q.question?.text}
                  {q.question?.image && <img src={q.question.image} alt="" className="mt-2 max-h-48 rounded-lg" />}
                </p>
                <div className="space-y-2">
                  {q.options?.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        quizAnswers[q.id] === opt.id
                          ? 'border-primary bg-primary/10'
                          : 'border-background-tertiary hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        checked={quizAnswers[q.id] === opt.id}
                        onChange={() => setQuizAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                        className="sr-only"
                      />
                      {opt.image ? (
                        <img src={opt.image} alt="" className="w-12 h-12 rounded object-cover" />
                      ) : null}
                      <span className="text-white/90">{opt.text || 'Option'}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {completed && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-6 flex items-center gap-4">
            <CheckCircle className="h-12 w-12 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Lesson completed</p>
              {progress?.quizScore != null && (
                <p className="text-white/70 text-sm">Quiz score: {Math.round(progress.quizScore)}%</p>
              )}
            </div>
          </div>
        )}

        {!completed && (
          <button
            onClick={handleComplete}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : hasQuiz ? 'Submit quiz' : 'Mark as complete'}
          </button>
        )}
      </div>
    </div>
  )
}
