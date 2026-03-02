'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, Square, Loader2, FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { transcriptApi, type Transcript } from '@/services/api/transcript.api'
import { cn } from '@/lib/utils'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [processAs, setProcessAs] = useState<'raw' | 'rearranged'>('raw')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const fetchTranscripts = useCallback(async () => {
    try {
      setError(null)
      const data = await transcriptApi.getTranscripts()
      setTranscripts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transcripts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTranscripts()
  }, [fetchTranscripts])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) {
          setError('Recording too short. Please speak for at least a second.')
          return
        }
        setTranscribing(true)
        try {
          const result = await transcriptApi.transcribe(blob, processAs)
          setTranscripts((prev) => [
            {
              id: result.transcriptId,
              rawText: result.rawText,
              processedText: result.rawText !== result.text ? result.text : null,
              sourceType: 'recording',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ])
          fetchTranscripts()
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Transcription failed')
        } finally {
          setTranscribing(false)
        }
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not access microphone')
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }

  const handleMicClick = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <>
      <PageHeader
        title="Transcripts"
        subtitle="Record speech and transcribe to text with AI"
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="text-white/60 text-sm">Transcription mode:</span>
        <div className="flex rounded-lg border border-background-tertiary p-1">
          <button
            onClick={() => setProcessAs('raw')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              processAs === 'raw' ? 'bg-primary text-background' : 'text-white/60 hover:text-white'
            )}
          >
            Raw
          </button>
          <button
            onClick={() => setProcessAs('rearranged')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              processAs === 'rearranged' ? 'bg-primary text-background' : 'text-white/60 hover:text-white'
            )}
          >
            Rearranged
          </button>
        </div>
        <p className="text-white/40 text-xs">
          {processAs === 'raw' ? 'As-is transcription' : 'AI corrects grammar & flow'}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Center: Mic / recording area */}
      <div className="relative flex justify-center items-center my-12 lg:my-16">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-white/5" />
          <div className="absolute w-40 h-40 rounded-full border border-primary/10" />
          <div className="absolute w-32 h-32 rounded-full border border-primary/20" />
        </div>

        {isRecording && (
          <div className="absolute w-24 h-24 rounded-full bg-red-500/30 animate-ping" />
        )}

        <button
          onClick={handleMicClick}
          disabled={transcribing}
          className={cn(
            'relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300',
            'shadow-xl shadow-primary/20',
            isRecording && 'bg-red-500 hover:bg-red-600 scale-110',
            transcribing && 'opacity-80 cursor-not-allowed',
            !isRecording && !transcribing && 'bg-primary hover:bg-primary-dark hover:scale-105'
          )}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {transcribing ? (
            <Loader2 className="h-12 w-12 text-background animate-spin" />
          ) : isRecording ? (
            <Square className="h-10 w-10 text-white" fill="currentColor" />
          ) : (
            <Mic className="h-12 w-12 text-background" />
          )}
        </button>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white/60 text-sm font-medium">
            {transcribing
              ? 'Transcribing...'
              : isRecording
                ? `Recording ${formatDuration(recordingTime)}`
                : 'Tap to record'}
          </p>
        </div>
      </div>

      {/* Transcript list */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Your transcripts</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : transcripts.length === 0 ? (
          <div className="card p-12 text-center">
            <Mic className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/80 font-medium">No transcripts yet</p>
            <p className="text-white/50 text-sm mt-1">Record your first one above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcripts.map((t) => (
              <TranscriptCard
                key={t.id}
                transcript={t}
                formatDate={formatDate}
                onDelete={() => setTranscripts((prev) => prev.filter((x) => x.id !== t.id))}
                onError={(msg) => setError(msg)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function TranscriptCard({
  transcript,
  formatDate,
  onDelete,
  onError,
}: {
  transcript: Transcript
  formatDate: (iso: string) => string
  onDelete: () => void
  onError: (msg: string) => void
}) {
  const [showRaw, setShowRaw] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const displayText = showRaw
    ? transcript.rawText
    : (transcript.processedText || transcript.rawText)
  const hasProcessed = !!transcript.processedText && transcript.processedText !== transcript.rawText

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await transcriptApi.deleteTranscript(transcript.id)
      onDelete()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to delete transcript')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white leading-relaxed whitespace-pre-wrap">{displayText || '(Empty)'}</p>
            <p className="text-white/40 text-xs mt-3">{formatDate(transcript.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete transcript"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        {hasProcessed && (
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline"
          >
            {showRaw ? (
              <>
                View polished
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View raw
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
