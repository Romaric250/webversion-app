'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { authApi } from '@/services/api/auth.api'
import { Toast } from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) return
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      {sent ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-white/60 text-sm mt-2 max-w-sm">
              If an account exists with <span className="text-white font-medium">{email}</span>, you will receive a password reset link shortly.
            </p>
            <p className="text-white/50 text-xs mt-3 max-w-sm">
              Can&apos;t find it? Check your spam or junk folder. If you use an .edu or institutional email, delivery may take a few minutes longer.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3.5 rounded-lg bg-primary text-background font-semibold text-center hover:bg-primary-dark transition-colors"
            >
              Back to sign in
            </Link>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail('') }}
              className="block w-full py-3 rounded-lg bg-background-secondary border border-background-tertiary text-white/80 font-medium hover:bg-background-tertiary transition-colors"
            >
              Try another email
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Forgot password</h1>
            <p className="text-white/60 text-sm mt-1">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Toast message={error} type="error" onDismiss={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary">
                <Mail className="h-5 w-5 text-white/50 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </>
      )}

      <p className="text-center text-white/60 text-sm mt-8">
        Remember your password?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
