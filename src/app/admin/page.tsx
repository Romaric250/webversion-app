'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, Search, Crown } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'

interface Stats {
  usersCount: number
  premiumCount: number
  signsCount: number
  coursesCount: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get<{ success: boolean; data: Stats }>(
          API_ENDPOINTS.ADMIN.STATS
        )
        if (data.success) setStats(data.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stats')
      }
    }
    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.usersCount ?? '—'}</p>
              <p className="text-white/60 text-sm">Total users</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.premiumCount ?? '—'}</p>
              <p className="text-white/60 text-sm">Premium users</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.signsCount ?? '—'}</p>
              <p className="text-white/60 text-sm">Dictionary signs</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.coursesCount ?? '—'}</p>
              <p className="text-white/60 text-sm">Courses</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
