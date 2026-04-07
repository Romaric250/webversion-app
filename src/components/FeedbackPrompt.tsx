'use client'

import { useEffect, useState, useRef } from 'react'
import { FeedbackModal } from '@/components/ui/FeedbackModal'

const STORAGE_SNOOZE = 'signova_feedback_snooze_until'

/** After ~90s in the app, prompt for feedback (respects snooze when dismissed). */
export function FeedbackPrompt() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const snoozeUntil = Number(localStorage.getItem(STORAGE_SNOOZE) || '0')
    if (Date.now() < snoozeUntil) return

    timerRef.current = setTimeout(() => setOpen(true), 90_000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    // Don’t prompt again for 10 days after dismiss
    localStorage.setItem(STORAGE_SNOOZE, String(Date.now() + 10 * 24 * 60 * 60 * 1000))
  }

  return <FeedbackModal isOpen={open} onClose={handleClose} />
}
