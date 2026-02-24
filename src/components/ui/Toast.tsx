'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onDismiss: () => void
  className?: string
}

export function Toast({ message, type = 'error', onDismiss, className }: ToastProps) {
  const styles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-primary/10 border-primary/30 text-primary',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  const icons = {
    error: '⚠',
    success: '✓',
    info: 'ℹ',
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border',
        styles[type],
        className
      )}
    >
      <span className="text-lg flex-shrink-0" aria-hidden>
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
