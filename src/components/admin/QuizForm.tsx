'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from './ImageUpload'

export interface QuizQuestion {
  id: string
  question: { text: string; image: string | null }
  options: Array<{
    id: string
    text: string
    image: string | null
    isCorrect: boolean
  }>
}

export interface QuizContent {
  questions: QuizQuestion[]
}

export interface QuizFormProps {
  value: QuizContent | null
  onChange: (value: QuizContent | null) => void
}

function genId() {
  return Math.random().toString(36).slice(2, 11)
}

export function QuizForm({ value, onChange }: QuizFormProps) {
  const questions = value?.questions ?? []

  const addQuestion = () => {
    const q: QuizQuestion = {
      id: genId(),
      question: { text: '', image: null },
      options: [
        { id: genId(), text: '', image: null, isCorrect: false },
        { id: genId(), text: '', image: null, isCorrect: false },
      ],
    }
    onChange({ questions: [...questions, q] })
  }

  const removeQuestion = (idx: number) => {
    const next = questions.filter((_, i) => i !== idx)
    onChange(next.length ? { questions: next } : null)
  }

  const updateQuestion = (idx: number, q: QuizQuestion) => {
    const next = [...questions]
    next[idx] = q
    onChange({ questions: next })
  }

  const addOption = (qIdx: number) => {
    const q = questions[qIdx]
    const opt = { id: genId(), text: '', image: null, isCorrect: false }
    const next = [...questions]
    next[qIdx] = {
      ...q,
      options: [...q.options, opt],
    }
    onChange({ questions: next })
  }

  const removeOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx]
    if (q.options.length <= 2) return
    const nextOpts = q.options.filter((_, i) => i !== optIdx)
    const hadCorrect = q.options[optIdx].isCorrect
    const nextOptsFixed = hadCorrect && nextOpts.length > 0
      ? nextOpts.map((o, i) => (i === 0 ? { ...o, isCorrect: true } : o))
      : nextOpts
    const next = [...questions]
    next[qIdx] = { ...q, options: nextOptsFixed }
    onChange({ questions: next })
  }

  const updateOption = (qIdx: number, optIdx: number, opt: QuizQuestion['options'][0]) => {
    const q = questions[qIdx]
    const nextOpts = [...q.options]
    nextOpts[optIdx] = opt
    if (opt.isCorrect) {
      nextOpts.forEach((o, i) => {
        if (i !== optIdx) nextOpts[i] = { ...o, isCorrect: false }
      })
    }
    const next = [...questions]
    next[qIdx] = { ...q, options: nextOpts }
    onChange({ questions: next })
  }

  const setCorrect = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx]
    const nextOpts = q.options.map((o, i) => ({ ...o, isCorrect: i === optIdx }))
    const next = [...questions]
    next[qIdx] = { ...q, options: nextOpts }
    onChange({ questions: next })
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">Quiz questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add question
        </button>
      </div>

      {questions.length === 0 ? (
        <div
          onClick={addQuestion}
          className="rounded-xl border-2 border-dashed border-background-tertiary p-8 text-center hover:border-primary/40 cursor-pointer transition-colors"
        >
          <p className="text-white/80 mb-1">No quiz questions</p>
          <p className="text-white/50 text-sm">Click to add your first question</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="rounded-xl border border-background-tertiary bg-background-secondary/50 p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-white/30 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1.5">
                      Question {qIdx + 1}
                    </label>
                    <input
                      value={q.question.text}
                      onChange={(e) =>
                        updateQuestion(qIdx, {
                          ...q,
                          question: { ...q.question, text: e.target.value },
                        })
                      }
                      placeholder="Enter your question"
                      className={inputClass}
                    />
                    <div className="mt-2">
                      <ImageUpload
                        value={q.question.image ?? undefined}
                        onChange={(url) =>
                          updateQuestion(qIdx, {
                            ...q,
                            question: { ...q.question, image: url || null },
                          })
                        }
                        label="Question image (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Options</label>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-background-tertiary/50"
                        >
                          <button
                            type="button"
                            onClick={() => setCorrect(qIdx, optIdx)}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                              opt.isCorrect
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-background-tertiary text-white/40 hover:border-white/30'
                            )}
                            title="Mark as correct"
                          >
                            {opt.isCorrect ? <Check className="h-4 w-4" /> : null}
                          </button>
                          <input
                            value={opt.text}
                            onChange={(e) =>
                              updateOption(qIdx, optIdx, { ...opt, text: e.target.value })
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            className={cn(inputClass, 'flex-1')}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, optIdx)}
                            disabled={q.options.length <= 2}
                            className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Remove option"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                    >
                      <Plus className="h-4 w-4" />
                      Add option
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
