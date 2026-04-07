'use client'

import Link from 'next/link'
import { ArrowLeft, Construction } from 'lucide-react'

export default function TranslatePage() {
  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/app"
          className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title">Text to Sign</h1>
          <p className="page-subtitle">Translate text into sign language</p>
        </div>
      </div>

      <div className="card max-w-2xl mx-auto p-10 sm:p-14 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/15 border border-primary/25 mb-6">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Coming soon</h2>
        <p className="text-white/70 text-base leading-relaxed max-w-md mx-auto mb-2">
          We&apos;re building a polished text-to-sign experience with adjustable signing speed and clear output.
        </p>
        <p className="text-white/50 text-sm mb-8">
          In the meantime, explore the dictionary, learning courses, and sign-to-text tools.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </>
  )
}
