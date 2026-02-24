'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Mic, Square, Loader2, MoreVertical, Trash2, LogOut, Share2, Copy, Check } from 'lucide-react'
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
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
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
    } catch {
      router.replace('/app/groups')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroup = async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { name: string; inviteCode: string; members: { userId: string; role: string; user?: { id: string } }[] } }>(
        `${API_BASE_URL}/groups/${id}`
      )
      if (data.success) {
        setGroupName(data.data.name)
        setInviteCode(data.data.inviteCode || '')
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
    socket.on('group:message', (msg: Message) => {
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
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Message }>(
        `${API_BASE_URL}/groups/${id}/messages`,
        { content: input.trim() }
      )
      if (data.success) setMessages((prev) => [...prev, data.data])
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
          const res = await fetch(`${API_BASE_URL}/groups/${id}/messages/voice`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success) setMessages((prev) => [...prev, data.data])
          }
        } catch {
          setError('Failed to send voice message')
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

  const handleLeaveGroup = async () => {
    try {
      await apiClient.post(`${API_BASE_URL}/groups/${id}/leave`)
      router.replace('/app/groups')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave group')
    }
    setMenuOpen(false)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/app/groups" className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{groupName || 'Group Chat'}</h1>
            <p className="text-white/50 text-sm">{messages.length} messages</p>
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
            return (
            <div
              key={m.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-sm font-bold">
                {m.user.name?.charAt(0) || '?'}
              </div>
              <div className={`flex-1 min-w-0 max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-primary text-background rounded-br-md'
                      : 'bg-background-secondary border border-background-tertiary rounded-bl-md'
                  }`}
                >
                  <p className="text-sm font-medium opacity-90">{m.user.name}</p>
                  <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  {m.type === 'voice' && m.rawContent && m.rawContent !== m.content && (
                    <details className="mt-2">
                      <summary className="text-xs opacity-75 cursor-pointer">View raw</summary>
                      <p className="mt-1 text-xs opacity-75">{m.rawContent}</p>
                    </details>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-1 px-1">{formatTime(m.createdAt)}</p>
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

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendText()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl bg-background-secondary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
          disabled={sending || recording || transcribing}
        />
        {!recording && !transcribing ? (
          <>
            <button
              onClick={startRecording}
              className="p-3 rounded-xl bg-background-secondary border border-background-tertiary text-white hover:bg-background-tertiary transition-colors"
              title="Record voice"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={sendText}
              disabled={!input.trim() || sending}
              className="p-3 rounded-xl bg-primary text-background hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </>
        ) : recording ? (
          <button
            onClick={stopRecording}
            className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <Square className="h-5 w-5" fill="currentColor" />
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-3 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            Transcribing...
          </span>
        )}
      </div>
    </div>
  )
}
