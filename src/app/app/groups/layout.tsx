'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Plus, Users, LogIn, Share2, Copy, Check } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Popup } from '@/components/ui/Popup'
import { apiClient } from '@/services/api/client'
import { API_BASE_URL } from '@/config/api'
import { cn } from '@/lib/utils'

interface Group {
  id: string
  name: string
  inviteCode: string
  members: { user: { id: string; name: string } }[]
  totalCount?: number
  unreadCount?: number
}

interface InviteGroup {
  id: string
  name: string
  inviteCode: string
}

function GroupsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedId = pathname.startsWith('/app/groups/') && pathname !== '/app/groups'
    ? pathname.split('/').pop() || ''
    : ''

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
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteGroup, setInviteGroup] = useState<InviteGroup | null>(null)
  const [joiningInvite, setJoiningInvite] = useState(false)

  const showListOnMobile = !selectedId
  const showChatOnMobile = !!selectedId

  useEffect(() => {
    const join = searchParams.get('join')
    if (join) {
      const code = join.trim().toUpperCase()
      setInviteCode(code)
      fetch(`${API_BASE_URL}/groups/by-invite/${code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setInviteGroup(data.data)
          } else {
            setJoinOpen(true)
          }
        })
        .catch(() => setJoinOpen(true))
    }
  }, [searchParams])

  const handleJoinFromInvite = async () => {
    if (!inviteGroup) return
    setJoiningInvite(true)
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Group }>(
        `${API_BASE_URL}/groups/join`,
        { inviteCode: inviteGroup.inviteCode }
      )
      if (data.success) {
        setGroups((prev) => (prev.some((g) => g.id === data.data.id) ? prev : [data.data, ...prev]))
        setInviteModalOpen(false)
        setInviteGroup(null)
        setInviteCode('')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join group')
    } finally {
      setJoiningInvite(false)
    }
  }

  const closeInviteModal = () => {
    setInviteModalOpen(false)
    setInviteGroup(null)
    if (inviteCode) setJoinOpen(true)
  }

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

  useEffect(() => {
    if (selectedId) fetchGroups()
  }, [selectedId])

  useEffect(() => {
    if (inviteGroup && !loading) {
      const alreadyMember = groups.some((g) => g.id === inviteGroup.id)
      if (alreadyMember) {
        setInviteModalOpen(false)
        setInviteGroup(null)
      } else {
        setInviteModalOpen(true)
      }
    }
  }, [inviteGroup, groups, loading])

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
      <div className="flex h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] min-h-0 -mx-4 sm:-mx-6 lg:-mx-8 -mb-6 lg:-mb-8">
        {/* Left sidebar - group list */}
        <aside className={cn(
          'w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-background-tertiary bg-background-secondary/50',
          'sm:flex',
          showListOnMobile ? 'flex' : 'hidden'
        )}>
          <div className="p-4 border-b border-background-tertiary">
            <h2 className="font-semibold text-white mb-3">Groups</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setJoinOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-background-tertiary border border-background-tertiary text-white font-medium hover:bg-background-elevated transition-colors text-sm"
              >
                <LogIn className="h-4 w-4" />
                Join
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark text-sm"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-4">
                <Toast message={error} type="error" onDismiss={() => setError(null)} />
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : groups.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="h-10 w-10 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-4">No groups yet</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setCreateOpen(true)} className="text-primary text-sm font-medium hover:underline">Create</button>
                  <span className="text-white/40">or</span>
                  <button onClick={() => setJoinOpen(true)} className="text-primary text-sm font-medium hover:underline">Join</button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-background-tertiary/50">
                {groups.map((g) => (
                  <div key={g.id} className="group">
                    <Link
                      href={`/app/groups/${g.id}`}
                      className={cn(
                        'flex items-center gap-3 p-4 hover:bg-background-tertiary/50 transition-colors',
                        selectedId === g.id && 'bg-primary/10 border-l-2 border-l-primary'
                      )}
                    >
                      <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{g.name}</p>
                        <p className="text-white/50 text-sm">{g.members?.length ?? 0} members · {(g.totalCount ?? 0)} messages</p>
                      </div>
                      {(g.unreadCount ?? 0) > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-background text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {g.unreadCount! > 99 ? '99+' : g.unreadCount}
                        </span>
                      )}
                      <button
                        onClick={(e) => openShare(g, e)}
                        className="p-2 rounded-lg text-white/40 hover:bg-background-tertiary hover:text-white opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                        title="Share group"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right - conversation */}
        <main className={cn(
          'flex-1 flex flex-col min-w-0 bg-background',
          'sm:flex',
          showChatOnMobile ? 'flex' : 'hidden'
        )}>
          {children}
        </main>
      </div>

      <Popup isOpen={inviteModalOpen} onClose={closeInviteModal} title="Join group" position="bottom-right">
        {inviteGroup && (
          <div className="space-y-4">
            <p className="text-white/70">
              You&apos;ve been invited to join <strong className="text-white">{inviteGroup.name}</strong>. Would you like to join?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleJoinFromInvite}
                disabled={joiningInvite}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {joiningInvite ? 'Joining...' : 'Yes, join'}
              </button>
              <button
                onClick={closeInviteModal}
                className="px-4 py-3 rounded-xl bg-background-tertiary text-white/80 font-medium hover:bg-background-elevated transition-colors"
              >
                No thanks
              </button>
            </div>
          </div>
        )}
      </Popup>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create group">
        <div className="space-y-4">
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Group name"
            className="w-full px-4 py-3 rounded-xl bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={createGroup}
              disabled={!createName.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              Create group
            </button>
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-3 rounded-xl bg-background-tertiary text-white/80 font-medium hover:bg-background-elevated transition-colors"
            >
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
            className="w-full px-4 py-3 rounded-xl bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 uppercase font-mono text-lg tracking-wider"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={joinGroup}
              disabled={!inviteCode.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              Join group
            </button>
            <button
              onClick={() => setJoinOpen(false)}
              className="px-4 py-3 rounded-xl bg-background-tertiary text-white/80 font-medium hover:bg-background-elevated transition-colors"
            >
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
                <input readOnly value={shareLink} className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white/80 text-sm font-mono truncate" />
                <button onClick={() => copyToClipboard(shareLink, 'link')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark">
                  {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Invite code</label>
              <div className="flex gap-2">
                <input readOnly value={shareGroup.inviteCode} className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white font-mono text-lg tracking-wider text-center" />
                <button onClick={() => copyToClipboard(shareGroup.inviteCode, 'code')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-tertiary text-white hover:bg-background-elevated">
                  {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <GroupsLayoutContent>{children}</GroupsLayoutContent>
    </Suspense>
  )
}
