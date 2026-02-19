'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api/auth.api'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, setIsLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const e: Partial<Record<string, string>> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    if (!confirmPassword) e.confirmPassword = 'Confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setIsLoading(true)
    try {
      const res = await authApi.signup({ name, email, password })
      login(res.user, res.token)
      router.replace('/app')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    router.replace('/app')
    return null
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
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-white/60 text-sm mt-1">Start your sign language journey today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Full name</label>
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary',
              errors.name && 'border-red-500'
            )}
          >
            <User className="h-5 w-5 text-white/50" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((p) => { const { name: _, ...rest } = p; return rest })
              }}
              placeholder="John Doe"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary',
              errors.email && 'border-red-500'
            )}
          >
            <Mail className="h-5 w-5 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((p) => { const { email: _, ...rest } = p; return rest })
              }}
              placeholder="you@example.com"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary',
              errors.password && 'border-red-500'
            )}
          >
            <Lock className="h-5 w-5 text-white/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((p) => { const { password: _, ...rest } = p; return rest })
              }}
              placeholder="At least 6 characters"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/50 hover:text-white p-1"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Confirm password</label>
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 bg-background-secondary border border-background-tertiary',
              errors.confirmPassword && 'border-red-500'
            )}
          >
            <Lock className="h-5 w-5 text-white/50" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((p) => { const { confirmPassword: _, ...rest } = p; return rest })
              }}
              placeholder="Repeat your password"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>
          )}
        </div>

        {submitError && (
          <p className="text-red-400 text-sm text-center py-2 rounded-lg bg-red-500/10">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-white/60 text-sm mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
