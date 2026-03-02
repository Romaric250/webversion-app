'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  /** Position: 'bottom-right' | 'top-center' | 'bottom-center' */
  position?: 'bottom-right' | 'top-center' | 'bottom-center'
}

export function Popup({ isOpen, onClose, title, children, className, position = 'bottom-right' }: PopupProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'top-center': 'top-20 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end items-end p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className={cn(
          'pointer-events-auto relative w-full max-w-sm rounded-xl bg-background-secondary border border-background-tertiary shadow-xl transition-all duration-200',
          positionClasses[position],
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-background-tertiary">
          <h2 id="popup-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:bg-background-tertiary hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
