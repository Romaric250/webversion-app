'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { chatsApi, type ChatSummary } from '@/services/api/chats.api'
import { cn } from '@/lib/utils'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const selectedId = pathname.startsWith('/app/chats/') && pathname !== '/app/chats'
    ? pathname.split('/').pop() || ''
    : ''

  const [chats, setChats] = useState<ChatSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = () => chatsApi.getMyChats().then(setChats).catch(() => {})

  useEffect(() => {
    fetchChats().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedId) fetchChats()
  }, [selectedId])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      const data = await chatsApi.searchUsers(query.trim())
      setUsers(data)
    } catch {
      setError('No user found')
    } finally {
      setSearching(false)
    }
  }

  const startChat = async (userId: string) => {
    setCreating(userId)
    setError(null)
    try {
      const chat = await chatsApi.getOrCreateChat(userId)
      setNewChatOpen(false)
      setQuery('')
      setUsers([])
      fetchChats()
      window.location.href = `/app/chats/${chat.id}`
    } catch {
      setError('Failed to start chat')
    } finally {
      setCreating(null)
    }
  }

  const openNewChat = () => {
    setNewChatOpen(true)
    setQuery('')
    setUsers([])
    setError(null)
  }

  const showListOnMobile = !selectedId
  const showChatOnMobile = !!selectedId

  return (
    <div className="flex h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] min-h-0 -mx-4 sm:-mx-6 lg:-mx-8 -mb-6 lg:-mb-8">
      {/* Left sidebar - chat list */}
      <aside className={cn(
        'w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-background-tertiary bg-background-secondary/50',
        'sm:flex',
        showListOnMobile ? 'flex' : 'hidden'
      )}>
        <div className="p-4 border-b border-background-tertiary flex items-center justify-between">
          <h2 className="font-semibold text-white">Chats</h2>
          <button
            onClick={openNewChat}
            className="p-2 rounded-lg bg-primary text-background hover:bg-primary-dark"
            title="New chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="h-10 w-10 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-4">No chats yet</p>
              <button
                onClick={openNewChat}
                className="text-primary text-sm font-medium hover:underline"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-background-tertiary/50">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/app/chats/${chat.id}`}
                  className={cn(
                    'flex items-center gap-3 p-4 hover:bg-background-tertiary/50 transition-colors',
                    selectedId === chat.id && 'bg-primary/10 border-l-2 border-l-primary'
                  )}
                >
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {chat.otherUser?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{chat.otherUser?.name || 'Unknown'}</p>
                    {chat.lastMessage && (
                      <p className="text-white/50 text-sm truncate">{chat.lastMessage.content}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {chat.lastMessage && (
                      <span className="text-white/40 text-xs">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                    {(chat.unreadCount ?? 0) > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-background text-xs font-semibold flex items-center justify-center">
                        {chat.unreadCount! > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
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

      <Modal isOpen={newChatOpen} onClose={() => { setNewChatOpen(false); setQuery(''); setUsers([]) }} title="New chat">
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Search for a user to start a conversation</p>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email"
              className="flex-1 px-4 py-3 rounded-xl bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary">
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-white/50 text-xs">{u.email}</p>
                </div>
                <button
                  onClick={() => startChat(u.id)}
                  disabled={creating === u.id}
                  className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50 text-sm"
                >
                  {creating === u.id ? 'Starting...' : 'Chat'}
                </button>
              </div>
            ))}
          </div>
          {users.length === 0 && query && !searching && (
            <p className="text-white/50 text-center py-4 text-sm">No user found</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
