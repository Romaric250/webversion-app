'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  /** When false, hides close button and prevents closing via X */
  closable?: boolean
}

export function Modal({ isOpen, onClose, title, children, className, closable = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={closable ? onClose : undefined}
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-md max-h-[90vh] flex flex-col rounded-xl bg-background-secondary border border-background-tertiary shadow-xl my-2 sm:my-0',
          className
        )}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-background-tertiary flex-shrink-0">
          <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-white truncate pr-2">
            {title}
          </h2>
          {closable && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:bg-background-tertiary hover:text-white transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">{children}</div>
      </div>
    </div>
  )
}
