'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mic,
  Square,
  Loader2,
  Copy,
  Check,
  Trash2,
  FileDown,
  Wand2,
} from 'lucide-react'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { notesApi, type Note } from '@/services/api/notes.api'
import { cn } from '@/lib/utils'
import { exportNoteToPdf, createNotePdfPreviewUrl } from '@/lib/exportNotePdf'

function formatRecordingTime(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [processAs, setProcessAs] = useState<'raw' | 'rearranged'>('rearranged')
  const [rewriting, setRewriting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!recording) {
      setRecordingSeconds(0)
      return
    }
    const started = Date.now()
    setRecordingSeconds(0)
    const id = window.setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - started) / 1000))
    }, 250)
    return () => window.clearInterval(id)
  }, [recording])

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    }
  }, [pdfPreviewUrl])

  const fetchNote = async () => {
    try {
      setError(null)
      const data = await notesApi.getById(id)
      setNote(data)
      setContent(data.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load note')
      router.replace('/app/notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNote()
  }, [id])

  const saveContent = async () => {
    if (!note) return
    try {
      setSaving(true)
      setError(null)
      const updated = await notesApi.update(id, { content })
      setNote(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleImproveText = async (useRaw: boolean) => {
    try {
      setRewriting(true)
      setError(null)
      const updated = await notesApi.rewrite(id, { useRaw })
      setNote(updated)
      setContent(updated.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not improve text')
    } finally {
      setRewriting(false)
    }
  }

  const closePdfPreview = () => {
    setPdfPreviewOpen(false)
    setPdfPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  /** Export opens preview first; download happens from the modal */
  const openExportPreview = () => {
    if (!note || !content.trim()) return
    const url = createNotePdfPreviewUrl(note.title, content || note.content)
    setPdfPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setPdfPreviewOpen(true)
  }

  const confirmExportDownload = () => {
    if (!note) return
    try {
      setExportingPdf(true)
      exportNoteToPdf(note.title, content || note.content)
    } finally {
      setTimeout(() => {
        setExportingPdf(false)
        closePdfPreview()
      }, 400)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) {
          setRecording(false)
          return
        }
        setTranscribing(true)
        try {
          const updated = await notesApi.addRecordingToNote(id, blob, { processAs })
          setNote(updated)
          setContent(updated.content)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to transcribe')
        } finally {
          setTranscribing(false)
          setRecording(false)
        }
      }
      recorder.start()
      setRecording(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not access microphone')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.state !== 'inactive' && mediaRecorderRef.current?.stop()
  }

  const copyShareLink = async () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/app/notes/${id}` : ''
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  const deleteNote = async () => {
    if (!confirm('Delete this note?')) return
    try {
      await notesApi.delete(id)
      router.replace('/app/notes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/app/notes"
          className="p-2 rounded-lg text-white/60 hover:bg-background-tertiary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white truncate">{note.title}</h1>
          <p className="text-white/50 text-sm">
            {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={openExportPreview}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated text-sm disabled:opacity-40"
            title="Review the PDF, then download"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated text-sm"
            title="Share note"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
          <button
            onClick={deleteNote}
            className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-white/60 text-sm mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            placeholder="Type your note here or use the record button below..."
            className="w-full min-h-[200px] px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 resize-none"
            disabled={recording || transcribing || rewriting}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-background-tertiary">
          <button
            type="button"
            onClick={() => handleImproveText(false)}
            disabled={rewriting || !content.trim() || recording || transcribing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 font-medium text-sm disabled:opacity-40"
            title="Use AI to fix grammar and structure into clear paragraphs"
          >
            {rewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Improve text
          </button>
          {note.rawContent ? (
            <button
              type="button"
              onClick={() => handleImproveText(true)}
              disabled={rewriting || recording || transcribing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated text-sm disabled:opacity-40"
              title="Rewrite from the original transcript (before AI edits)"
            >
              Improve from transcript
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-background-tertiary">
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-xs">Voice note</span>
            <div className="flex rounded-lg border border-background-tertiary p-1">
              <button
                type="button"
                onClick={() => setProcessAs('raw')}
                className={cn(
                  'px-3 py-1.5 rounded text-sm',
                  processAs === 'raw' ? 'bg-primary text-background' : 'text-white/60'
                )}
              >
                Raw transcript
              </button>
              <button
                type="button"
                onClick={() => setProcessAs('rearranged')}
                className={cn(
                  'px-3 py-1.5 rounded text-sm',
                  processAs === 'rearranged' ? 'bg-primary text-background' : 'text-white/60'
                )}
              >
                AI-improved
              </button>
            </div>
            <p className="text-white/40 text-xs max-w-[220px]">
              {processAs === 'rearranged'
                ? 'Transcript is cleaned and split into paragraphs.'
                : 'Exact speech-to-text, no rewriting.'}
            </p>
          </div>
          {!recording && !transcribing ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-tertiary text-white hover:bg-background-elevated font-medium"
            >
              <Mic className="h-4 w-4" />
              Record voice
            </button>
          ) : recording ? (
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30"
                aria-live="polite"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"
                  aria-hidden
                />
                <span className="text-white/70 text-sm">Recording</span>
                <span className="font-mono tabular-nums text-lg font-semibold text-primary min-w-[3.5rem]">
                  {formatRecordingTime(recordingSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium"
              >
                <Square className="h-4 w-4" fill="currentColor" />
                Stop
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcribing...
            </span>
          )}
          <button
            type="button"
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50 ml-auto"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {note.rawContent && (
        <div className="mt-4 card p-4">
          <p className="text-white/60 text-xs mb-2">Original transcript</p>
          <p className="text-white/80 text-sm whitespace-pre-wrap">{note.rawContent}</p>
        </div>
      )}

      <Modal
        isOpen={pdfPreviewOpen}
        onClose={closePdfPreview}
        title="Export PDF"
        className="max-w-4xl w-full"
      >
        <div className="flex flex-col gap-4 min-h-0">
          <p className="text-white/60 text-sm">
            Check the preview below. When you’re happy with it, download the file to your device.
          </p>
          {pdfPreviewUrl ? (
            <iframe
              title="PDF export preview"
              src={`${pdfPreviewUrl}#toolbar=1&navpanes=0`}
              className="w-full h-[min(72vh,820px)] rounded-lg border border-background-tertiary bg-white"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-white/50 text-sm">Loading preview…</div>
          )}
          <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-background-tertiary">
            <button
              type="button"
              onClick={closePdfPreview}
              className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmExportDownload}
              disabled={exportingPdf || !content.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-semibold text-sm disabled:opacity-40"
            >
              {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
