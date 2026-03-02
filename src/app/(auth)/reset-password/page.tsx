'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authApi } from '@/services/api/auth.api'
import { Toast } from '@/components/ui/Toast'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token || !password || password !== confirm) {
      setError(password !== confirm ? 'Passwords do not match' : 'Please fill all fields')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-white/90 text-sm">Invalid or missing reset token. The link may have expired.</p>
          </div>
          <Link
            href="/forgot-password"
            className="block w-full py-3.5 rounded-lg bg-primary text-background font-semibold text-center hover:bg-primary-dark transition-colors"
          >
            Request new reset link
          </Link>
        </div>
      </>
    )
  }

  if (success) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Password reset</h1>
            <p className="text-white/60 text-sm mt-2">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3.5 rounded-lg bg-primary text-background font-semibold text-center hover:bg-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </div>
      </>
    )
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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="text-white/60 text-sm mt-1">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">New password</label>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary">
            <Lock className="h-5 w-5 text-white/50 flex-shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/50 hover:text-white p-1"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Confirm password</label>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary">
            <Lock className="h-5 w-5 text-white/50 flex-shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
              required
              minLength={8}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
