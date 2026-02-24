'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Users, LogIn, Share2, Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { apiClient } from '@/services/api/client'
import { API_BASE_URL } from '@/config/api'

interface Group {
  id: string
  name: string
  inviteCode: string
  members: { user: { id: string; name: string } }[]
}

export default function GroupsPage() {
  const searchParams = useSearchParams()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareGroup, setShareGroup] = useState<Group | null>(null)
  const [createName, setCreateName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  useEffect(() => {
    const join = searchParams.get('join')
    if (join) {
      setInviteCode(join.toUpperCase())
      setJoinOpen(true)
    }
  }, [searchParams])

  const fetchGroups = async () => {
    try {
      setError(null)
      const { data } = await apiClient.get<{ success: boolean; data: Group[] }>(`${API_BASE_URL}/groups`)
      if (data.success) setGroups(data.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const createGroup = async () => {
    if (!createName.trim()) return
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Group }>(`${API_BASE_URL}/groups`, { name: createName.trim() })
      if (data.success) {
        setGroups((prev) => [data.data, ...prev])
        setCreateName('')
        setCreateOpen(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create group')
    }
  }

  const joinGroup = async () => {
    if (!inviteCode.trim()) return
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Group }>(`${API_BASE_URL}/groups/join`, { inviteCode: inviteCode.trim().toUpperCase() })
      if (data.success) {
        setGroups((prev) => (prev.some((g) => g.id === data.data.id) ? prev : [data.data, ...prev]))
        setInviteCode('')
        setJoinOpen(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join group')
    }
  }

  const openShare = (g: Group, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShareGroup(g)
    setShareOpen(true)
  }

  const shareLink = shareGroup && typeof window !== 'undefined'
    ? `${window.location.origin}/app/groups?join=${shareGroup.inviteCode}`
    : ''

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  return (
    <>
      <PageHeader title="Transcription Groups" subtitle="Share and collaborate in real-time" actions={
        <div className="flex gap-2">
          <button onClick={() => setJoinOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-secondary border border-background-tertiary text-white hover:bg-background-tertiary">
            <LogIn className="h-5 w-5" /> Join
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark">
            <Plus className="h-5 w-5" /> Create
          </button>
        </div>
      } />

      {error && (
        <div className="mb-6">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create group">
        <div className="space-y-4">
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Group name"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={createGroup} disabled={!createName.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50">
              Create
            </button>
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={joinOpen} onClose={() => setJoinOpen(false)} title="Join group">
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Enter the invite code shared with you</p>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3D4"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 uppercase font-mono text-lg tracking-wider"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={joinGroup} disabled={!inviteCode.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50">
              Join
            </button>
            <button onClick={() => setJoinOpen(false)} className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={shareOpen} onClose={() => { setShareOpen(false); setShareGroup(null) }} title={shareGroup ? `Share ${shareGroup.name}` : 'Share group'}>
        {shareGroup && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Share this link or invite code so others can join the group</p>

            <div>
              <label className="block text-white/60 text-xs mb-1">Invite link</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white/80 text-sm font-mono truncate"
                />
                <button
                  onClick={() => copyToClipboard(shareLink, 'link')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
                >
                  {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1">Invite code</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareGroup.inviteCode}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white font-mono text-lg tracking-wider text-center"
                />
                <button
                  onClick={() => copyToClipboard(shareGroup.inviteCode, 'code')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-tertiary text-white hover:bg-background-elevated"
                >
                  {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/80 font-medium mb-1">No groups yet</p>
          <p className="text-white/50 text-sm mb-6">Create or join a group to collaborate</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-background font-semibold"><Plus className="h-4 w-4" /> Create group</button>
            <button onClick={() => setJoinOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-background-secondary border border-background-tertiary text-white"><LogIn className="h-4 w-4" /> Join group</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="card card-hover p-5 flex items-start justify-between gap-3">
              <Link href={`/app/groups/${g.id}`} className="flex-1 min-w-0 flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"><Users className="h-6 w-6 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{g.name}</h3>
                  <p className="text-white/50 text-sm mt-0.5">{g.members?.length ?? 0} members</p>
                  <p className="text-white/40 text-xs mt-1 font-mono">Code: {g.inviteCode}</p>
                </div>
              </Link>
              <button
                onClick={(e) => openShare(g, e)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-primary/20 hover:text-primary transition-colors flex-shrink-0 text-sm"
                title="Share group"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
