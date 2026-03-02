'use client'

import Link from 'next/link'
import { Hand, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

export default function SignToTextPage() {
  return (
    <>
      <PageHeader
        title="Sign to Text"
        subtitle="Convert sign language to text in real-time"
      />

      <div className="card p-12 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Hand className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
        <p className="text-white/70 mb-8">
          We&apos;re building real-time sign language recognition. Soon you&apos;ll be able to sign and see your gestures translated to text instantly.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </>
  )
}
