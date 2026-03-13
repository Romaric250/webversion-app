'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Mic, Square, Loader2, MoreVertical, Trash2, LogOut, Share2, Copy, Check, Edit2, Pause, X, Users } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { API_BASE_URL } from '@/config/api'
import { getAuthToken } from '@/lib/storage'
import { getGroupSocket } from '@/lib/socket'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'

interface Message {
  id: string
  content: string
  rawContent: string | null
  type: 'text' | 'voice'
  createdAt: string
  user: { id: string; name: string; email: string }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function GroupChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const id = String(params.id)
  const [groupName, setGroupName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [members, setMembers] = useState<{ userId: string; role: string; user?: { id: string; name: string } }[]>([])
  const [messageMenuId, setMessageMenuId] = useState<string | null>(null)
  const [editMessageId, setEditMessageId] = useState<string | null>(null)
  const [editMessageContent, setEditMessageContent] = useState('')
  const [editName, setEditName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recordingPaused, setRecordingPaused] = useState(false)
  const recordingCancelledRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        router.replace('/login')
        return
      }
      const res = await fetch(`${API_BASE_URL}/groups/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 403) router.replace('/app/groups')
        return
      }
      const data = await res.json()
      setMessages(data.data || [])
      setTotalCount(data.pagination?.total ?? data.data?.length ?? 0)
    } catch {
      router.replace('/app/groups')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroup = async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { name: string; inviteCode: string; members: { userId: string; role: string; user?: { id: string; name: string } }[] } }>(
        `${API_BASE_URL}/groups/${id}`
      )
      if (data.success) {
        setGroupName(data.data.name)
        setInviteCode(data.data.inviteCode || '')
        setMembers(data.data.members || [])
        const myMember = data.data.members?.find((m: any) => m.userId === user?.id || m.user?.id === user?.id)
        setIsAdmin(myMember?.role === 'admin')
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchGroup()
    fetchMessages()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    const socket = getGroupSocket(token)
    if (!socket) return
    socket.emit('group:join', id)
    socket.on('group:message', (msg: Message & { _action?: string }) => {
      if (msg._action === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id))
        return
      }
      if (msg._action === 'update') {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)))
        return
      }
      if (msg.user?.id === user?.id) return
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
    })
    return () => {
      socket.emit('group:leave', id)
      socket.off('group:message')
    }
  }, [id])

  const sendText = async () => {
    if (!input.trim()) return
    setSending(true)
    setError(null)
    setTranscriptPreview(null)
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Message }>(
        `${API_BASE_URL}/groups/${id}/messages`,
        { content: input.trim() }
      )
      if (data.success) {
        setMessages((prev) => [...prev, data.data])
        setTotalCount((prev) => prev + 1)
      }
      setInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
        setRecordingPaused(false)
        if (recordingCancelledRef.current) {
          recordingCancelledRef.current = false
          setRecording(false)
          return
        }
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) {
          setRecording(false)
          return
        }
        setTranscribing(true)
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          const token = getAuthToken()
          const res = await fetch(`${API_BASE_URL}/translate/transcribe`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success) {
              const transcript = data.data?.text || data.data?.rawText || ''
              setTranscriptPreview(transcript)
              setInput((prev) => (prev ? `${prev}\n\n${transcript}` : transcript))
            }
          }
        } catch {
          setError('Failed to transcribe')
        } finally {
          setTranscribing(false)
          setRecording(false)
        }
      }
      recorder.start()
      setRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    }).catch(() => setError('Could not access microphone'))
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.state !== 'inactive' && mediaRecorderRef.current?.stop()
  }

  const cancelRecording = () => {
    recordingCancelledRef.current = true
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
      chunksRef.current = []
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingTime(0)
    setRecording(false)
    setRecordingPaused(false)
  }

  const togglePauseRecording = () => {
    const rec = mediaRecorderRef.current
    if (!rec) return
    if (recordingPaused) {
      rec.resume()
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } else {
      rec.pause()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    setRecordingPaused(!recordingPaused)
  }

  const handleDeleteGroup = async () => {
    if (!isAdmin) return
    try {
      await apiClient.delete(`${API_BASE_URL}/groups/${id}`)
      router.replace('/app/groups')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete group')
    }
    setMenuOpen(false)
  }

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/app/groups?join=${inviteCode}` : ''

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  const handleUpdateGroupName = async () => {
    if (!editName.trim() || editName === groupName) {
      setEditOpen(false)
      return
    }
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: { name: string } }>(
        `${API_BASE_URL}/groups/${id}`,
        { name: editName.trim() }
      )
      if (data.success) {
        setGroupName(data.data.name)
        setEditOpen(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    }
    setMenuOpen(false)
  }

  const openEdit = () => {
    setEditName(groupName)
    setEditOpen(true)
    setMenuOpen(false)
  }

  const handleDeleteMessage = async (messageId: string) => {
    setMessageMenuId(null)
    try {
      await apiClient.delete(`${API_BASE_URL}/groups/${id}/messages/${messageId}`)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete message')
    }
  }

  const openEditMessage = (m: Message) => {
    setEditMessageId(m.id)
    setEditMessageContent(m.content)
    setMessageMenuId(null)
  }

  const handleUpdateMessage = async () => {
    if (!editMessageId || !editMessageContent.trim()) {
      setEditMessageId(null)
      return
    }
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: Message }>(
        `${API_BASE_URL}/groups/${id}/messages/${editMessageId}`,
        { content: editMessageContent.trim() }
      )
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m.id === editMessageId ? data.data : m)))
        setEditMessageId(null)
        setEditMessageContent('')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update message')
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await apiClient.post(`${API_BASE_URL}/groups/${id}/leave`)
      router.replace('/app/groups')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave group')
    }
    setMenuOpen(false)
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/groups/${id}/members/${userId}`)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
      setMembersOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove member')
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] min-h-0">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/app/groups" className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white flex-shrink-0 sm:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{groupName || 'Group Chat'}</h1>
            <p className="text-white/50 text-sm">{totalCount || messages.length} messages</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 py-2 rounded-lg bg-background-secondary border border-background-tertiary shadow-xl z-20 min-w-[180px]">
                <button
                  onClick={() => { setShareOpen(true); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  Share group
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={openEdit}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit name
                    </button>
                    <button
                      onClick={() => { setMembersOpen(true); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                    >
                      <Users className="h-4 w-4" />
                      Manage members
                    </button>
                  </>
                )}
                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Leave group
                </button>
                {isAdmin && (
                  <button
                    onClick={handleDeleteGroup}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 text-left text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete group
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit group name">
        <div className="space-y-4">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Group name"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleUpdateGroupName} disabled={!editName.trim() || editName === groupName} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50">
              Save
            </button>
            <button onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editMessageId !== null} onClose={() => { setEditMessageId(null); setEditMessageContent('') }} title="Edit message">
        <div className="space-y-4">
          <textarea
            value={editMessageContent}
            onChange={(e) => setEditMessageContent(e.target.value)}
            placeholder="Message content"
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleUpdateMessage} disabled={!editMessageContent.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50">
              Save
            </button>
            <button onClick={() => { setEditMessageId(null); setEditMessageContent('') }} className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={membersOpen} onClose={() => setMembersOpen(false)} title="Manage members">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between py-2 border-b border-background-tertiary last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {m.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-white">{m.user?.name || 'Unknown'}</p>
                  <p className="text-white/50 text-xs">{m.role}</p>
                </div>
              </div>
              {isAdmin && m.userId !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(m.userId)}
                  className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share group">
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Share this link or invite code so others can join</p>
          <div>
            <label className="block text-white/60 text-xs mb-1">Invite link</label>
            <div className="flex gap-2">
              <input readOnly value={shareLink} className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white/80 text-sm font-mono truncate" />
              <button onClick={copyShareLink} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Invite code</label>
            <div className="flex gap-2">
              <input readOnly value={inviteCode} className="flex-1 px-4 py-2.5 rounded-lg bg-background-tertiary border border-background-tertiary text-white font-mono text-lg tracking-wider text-center" />
              <button onClick={copyInviteCode} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-tertiary text-white hover:bg-background-elevated">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-sm">No messages yet. Say hello!</div>
        ) : (
          messages.map((m) => {
            const isOwn = m.user?.id === user?.id
            const canModify = isOwn || isAdmin
            const menuOpenForThis = messageMenuId === m.id
            return (
            <div
              key={m.id}
              className={`flex gap-2 sm:gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0 text-white/80 text-sm font-semibold">
                {m.user.name?.charAt(0) || '?'}
              </div>
              <div className={`flex-1 min-w-0 max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <p className={`text-xs font-medium text-white/50 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {m.user.name}
                </p>
                <div className={`flex gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                      isOwn
                        ? 'bg-indigo-600/90 text-white rounded-br-md'
                        : 'bg-background-secondary border border-background-tertiary text-white/90 rounded-bl-md'
                    }`}
                  >
                    <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    {m.type === 'voice' && m.rawContent && m.rawContent !== m.content && (
                      <details className="mt-2">
                        <summary className="text-xs text-white/70 cursor-pointer">View raw</summary>
                        <p className="mt-1 text-xs text-white/60">{m.rawContent}</p>
                      </details>
                    )}
                  </div>
                  {canModify && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setMessageMenuId(menuOpenForThis ? null : m.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:bg-background-tertiary hover:text-white transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpenForThis && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMessageMenuId(null)} />
                          <div className={`absolute z-20 py-1 rounded-lg bg-background-secondary border border-background-tertiary shadow-xl min-w-[120px] ${isOwn ? 'right-0' : 'left-0'}`}>
                            {isOwn && (
                              <button
                                onClick={() => openEditMessage(m)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-left text-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-white/40 text-xs px-1 ${isOwn ? 'text-right' : 'text-left'}`}>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {(recording || transcribing) && (
        <div className="mb-2 flex items-center gap-2 text-white/60 text-sm">
          {recording && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording {formatDuration(recordingTime)}
              {recordingPaused && " (paused)"}
            </span>
          )}
          {transcribing && (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcribing...
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 flex-shrink-0">
        {transcriptPreview && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
            <p className="text-xs font-medium text-primary/90 mb-1">Transcribed from voice</p>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{transcriptPreview}</p>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendText()
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-background-tertiary text-white text-base placeholder:text-white/40 outline-none focus:border-primary/50 resize-y min-h-[44px] max-h-[120px] overflow-y-auto [&::-webkit-input-placeholder]:text-white/40"
              style={{ WebkitTextFillColor: 'inherit' }}
              autoComplete="off"
              data-lpignore="true"
              disabled={sending || recording || transcribing}
            />
          </div>
          {!recording && !transcribing ? (
            <>
              <button
                onClick={startRecording}
                className="p-3 rounded-xl bg-background-secondary border border-background-tertiary text-white hover:bg-background-tertiary transition-colors flex-shrink-0"
                title="Record voice"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={sendText}
                disabled={!input.trim() || sending}
                className="p-3 rounded-xl bg-primary text-background hover:bg-primary-dark disabled:opacity-50 transition-colors flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </>
          ) : recording ? (
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={togglePauseRecording}
                className="p-2.5 sm:p-3 rounded-xl bg-background-secondary border border-background-tertiary text-white hover:bg-background-tertiary transition-colors"
                title={recordingPaused ? "Resume" : "Pause"}
              >
                <Pause className="h-5 w-5" />
              </button>
              <button
                onClick={stopRecording}
                className="p-2.5 sm:p-3 rounded-xl bg-primary text-background hover:bg-primary-dark transition-colors"
                title="Finish and transcribe"
              >
                <Square className="h-5 w-5" fill="currentColor" />
              </button>
              <button
                onClick={cancelRecording}
                className="p-2.5 sm:p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-2 px-3 py-3 text-white/60 flex-shrink-0">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Transcribing...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
