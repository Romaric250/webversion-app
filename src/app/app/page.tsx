'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mic, Hand, BookOpen, Flame, Clock, ArrowRight, Lightbulb, FileText, ScanLine, Users, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { apiClient } from '@/services/api/client'
import { API_BASE_URL } from '@/config/api'
import { chatsApi } from '@/services/api/chats.api'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  const [chats, setChats] = useState<{ id: string; otherUser?: { name: string } }[]>([])
  const [progress, setProgress] = useState<{ signsLearned: number; streak: number; practiceTime: number } | null>(null)

  useEffect(() => {
    Promise.all([
      apiClient.get<{ success: boolean; data: any[] }>(`${API_BASE_URL}/groups`),
      chatsApi.getMyChats(),
      apiClient.get<{ success: boolean; data: any }>(`${API_BASE_URL}/progress`),
    ]).then(([gRes, cData, pRes]) => {
      if (gRes.data.success && gRes.data.data) setGroups(gRes.data.data)
      setChats(cData)
      if (pRes.data.success && pRes.data.data) setProgress(pRes.data.data)
    }).catch(() => {})
  }, [])

  const quickActions = [
    {
      href: '/app/translate',
      title: 'Text to Sign',
      subtitle: 'Translate text to sign language with avatar',
      icon: Hand,
      gradient: 'from-emerald-600/20 to-emerald-900/10',
    },
    {
      href: '/app/sign-to-text',
      title: 'Sign to Text',
      subtitle: 'Convert sign language to text (coming soon)',
      icon: ScanLine,
      gradient: 'from-teal-600/20 to-teal-900/10',
    },
    {
      href: '/app/transcripts',
      title: 'Transcripts',
      subtitle: 'Record and replay conversations',
      icon: Mic,
      gradient: 'from-violet-600/20 to-violet-900/10',
    },
    {
      href: '/app/learning',
      title: 'Learning Hub',
      subtitle: 'Interactive lessons and courses',
      icon: BookOpen,
      gradient: 'from-blue-600/20 to-blue-900/10',
    },
    {
      href: '/app/notes',
      title: 'Notes',
      subtitle: 'Capture vocabulary and ideas',
      icon: FileText,
      gradient: 'from-amber-600/20 to-amber-900/10',
    },
  ]

  const stats = [
    { label: 'Signs Learned', value: String(progress?.signsLearned ?? 0), icon: Hand },
    { label: 'Day Streak', value: String(progress?.streak ?? 0), icon: Flame },
    { label: 'Minutes Today', value: String(progress?.practiceTime ?? 0), icon: Clock },
  ]

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here&apos;s your progress and quick actions"
      />

      {/* Hero CTA */}
      <section className="mb-10">
        <Link
          href="/app/translate"
          className="block card card-hover overflow-hidden group"
        >
          <div className="relative h-44 sm:h-52 bg-gradient-to-br from-primary/15 via-background-tertiary to-background-secondary p-6 sm:p-8 flex flex-col justify-end">
            <span className="inline-flex px-2.5 py-1 rounded-md bg-primary text-background text-xs font-semibold w-fit mb-3">
              FEATURED
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Start a Conversation
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-xl mb-4">
              Speak naturally and see real-time transcription. Powered by SignNova.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold w-fit group-hover:bg-primary-dark transition-colors">
              <Mic className="h-4 w-4" />
              Try Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </section>

      {/* Stats */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="card p-6 sm:p-8"
              >
                <Icon className="h-6 w-6 text-primary mb-4" />
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Groups & Chats */}
      {(groups.length > 0 || chats.length > 0) && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.length > 0 && (
              <Link href="/app/groups" className="card card-hover p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white">Your Groups</p>
                  <p className="text-white/60 text-sm">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40 ml-auto" />
              </Link>
            )}
            {chats.length > 0 && (
              <Link href="/app/chats" className="card card-hover p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white">Recent Chats</p>
                  <p className="text-white/60 text-sm">{chats.length} chat{chats.length !== 1 ? 's' : ''}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40 ml-auto" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`card card-hover p-6 bg-gradient-to-br ${action.gradient} border-background-tertiary`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-white/70 text-sm mb-4">{action.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Daily Tip */}
      <section>
        <div className="card p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                Daily Tip
              </p>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Practice fingerspelling your name every morning to build muscle memory. 
                Consistency is key to mastering sign language! 🤟
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
