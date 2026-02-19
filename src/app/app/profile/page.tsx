'use client'

import { User, Bell, HelpCircle, Info } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/layout/PageHeader'

const menuItems = [
  { icon: User, title: 'Edit Profile', description: 'Update your name and email' },
  { icon: Bell, title: 'Notifications', description: 'Manage notification preferences' },
  { icon: HelpCircle, title: 'Help & Support', description: 'Get help and contact us' },
  { icon: Info, title: 'About', description: 'Learn more about SignNova' },
]

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account and preferences" />

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-background">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-white/60 text-sm mt-0.5">{user?.email || ''}</p>
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium">
                Beginner
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-white/60 text-sm mt-1">Signs Learned</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-white/60 text-sm mt-1">Day Streak</p>
          </div>
        </div>

        {/* Menu */}
        <div className="card overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.title}
                onClick={() => {}}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-background-tertiary/50 transition-colors ${
                  i < menuItems.length - 1 ? 'border-b border-background-tertiary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-white/50 text-sm">{item.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
