'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Mic, Square, Loader2, Pause, X } from 'lucide-react'
import { chatsApi } from '@/services/api/chats.api'
import { API_BASE_URL } from '@/config/api'
import { getAuthToken } from '@/lib/storage'
import { getGroupSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  rawContent?: string | null
  type: string
  createdAt: string
  user: { id: string; name: string }
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

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const id = String(params.id)
  const [otherUser, setOtherUser] = useState<{ name: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingPaused, setRecordingPaused] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const recordingCancelledRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      chatsApi.getChat(id),
      chatsApi.getMessages(id),
    ]).then(([chat, { messages: msgs, total }]) => {
      const other = chat.participants?.find((p: any) => p.userId !== user?.id)?.user
      setOtherUser(other ? { name: other.name } : null)
      setMessages(msgs || [])
      setTotalCount(total)
    }).catch(() => router.replace('/app/chats')).finally(() => setLoading(false))
  }, [id, user?.id])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    const socket = getGroupSocket(token)
    if (!socket) return
    socket.emit('chat:join', id)
    socket.on('chat:message', (msg: Message & { _action?: string }) => {
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
      socket.emit('chat:leave', id)
      socket.off('chat:message')
    }
  }, [id, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      const msg = await chatsApi.sendMessage(id, input.trim())
      setMessages((prev) => [...prev, msg])
      setTotalCount((prev) => prev + 1)
      setInput('')
    } catch {
      // error
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
              setInput((prev) => (prev ? `${prev}\n\n${transcript}` : transcript))
            }
          }
        } catch {
          // Failed to transcribe
        } finally {
          setTranscribing(false)
          setRecording(false)
        }
      }
      recorder.start()
      setRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    }).catch(() => {})
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

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] min-h-0">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 flex-shrink-0">
        <Link
          href="/app/chats"
          className={cn(
            'p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white flex-shrink-0',
            'sm:hidden'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">{otherUser?.name || 'Chat'}</h1>
          <p className="text-white/50 text-sm">{totalCount || messages.length} messages</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-sm">No messages yet. Say hello!</div>
        ) : (
          messages.map((m) => {
            const isOwn = m.user?.id === user?.id
            return (
              <div key={m.id} className={`flex gap-2 sm:gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0 text-white/80 text-sm font-semibold">
                  {m.user.name?.charAt(0) || '?'}
                </div>
                <div className={`flex-1 min-w-0 max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <p className={`text-xs font-medium text-white/50 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {m.user.name}
                  </p>
                  <div
                    className={`rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                      isOwn
                        ? 'bg-indigo-600/90 text-white rounded-br-md'
                        : 'bg-background-secondary border border-background-tertiary text-white/90 rounded-bl-md'
                    }`}
                  >
                    <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                    {m.type === 'voice' && m.rawContent && m.rawContent !== m.content && (
                      <details className="mt-2">
                        <summary className="text-xs text-white/70 cursor-pointer">View raw</summary>
                        <p className="mt-1 text-xs text-white/60">{m.rawContent}</p>
                      </details>
                    )}
                  </div>
                  <p className={`text-white/40 text-xs px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(m.createdAt)}
                  </p>
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
              {recordingPaused && ' (paused)'}
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
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-background-secondary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 resize-y min-h-[44px] max-h-[120px] overflow-y-auto"
            disabled={sending || recording || transcribing}
          />
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
                onClick={sendMessage}
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
                title={recordingPaused ? 'Resume' : 'Pause'}
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
