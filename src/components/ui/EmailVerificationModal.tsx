'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import { authApi } from '@/services/api/auth.api'
import { useAuthStore } from '@/store/authStore'

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function EmailVerificationModal({ isOpen, onClose, userEmail }: EmailVerificationModalProps) {
  const { user, setUser, logout } = useAuthStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialSending, setInitialSending] = useState(true)

  // Brief loading state so the email (sent by backend on signup/login) has time to be delivered
  useEffect(() => {
    if (!isOpen) return
    setInitialSending(true)
    const timer = setTimeout(() => setInitialSending(false), 7000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      await authApi.verifyOtp(code.trim())
      setUser({ ...user!, emailVerified: true })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setResending(true)
    try {
      await authApi.resendVerificationCode()
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify your email" closable={false}>
      <div className="space-y-4">
        {initialSending ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-white/80 text-sm text-center">
              Sending verification code to <strong className="text-white">{userEmail}</strong>...
            </p>
            <p className="text-white/50 text-xs text-center">
              Please wait a moment for the email to be delivered.
            </p>
          </div>
        ) : (
          <>
        <p className="text-white/80 text-sm">
          We sent a 6-digit verification code to <strong className="text-white">{userEmail}</strong>. Enter it below to access your account.
        </p>
        <p className="text-white/50 text-xs">
          Can&apos;t find it? Check your spam or junk folder. If you use an .edu or institutional email, delivery may take a few minutes longer.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl bg-background-tertiary border border-background-tertiary text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 outline-none focus:border-primary/50"
              autoComplete="one-time-code"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          {sent && (
            <p className="text-primary text-sm">New code sent. Check your inbox (and spam folder if needed).</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="px-4 py-3 rounded-xl bg-background-tertiary text-white/80 hover:bg-background-elevated disabled:opacity-50 text-sm font-medium"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </form>
        <div className="pt-4 border-t border-background-tertiary">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-2.5 text-sm text-red-400 hover:text-red-300 underline transition-colors"
          >
            Sign out
          </button>
        </div>
          </>
        )}
      </div>
    </Modal>
  )
}
