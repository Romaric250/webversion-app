'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api/auth.api'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading, setIsLoading } = useAuthStore()
  const redirectTo = searchParams.get('redirect') || '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setIsLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res.user, res.token)
      router.replace(redirectTo)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    router.replace(redirectTo)
    return null
  }

  return (
    <>
      <div className="lg:hidden mb-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="SignNova" className="w-10 h-10 rounded-xl object-contain" />
          <span className="text-lg font-bold text-white">SignNova</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-1">Sign in to continue to your account</p>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white hidden lg:block">Sign in</h1>
        <p className="text-white/60 text-sm mt-1 hidden lg:block">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
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
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
              }}
              placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-primary text-sm font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        {submitError && (
          <p className="text-red-400 text-sm text-center py-2 rounded-lg bg-red-500/10">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-white/60 text-sm mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
