'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { notesApi, type Note } from '@/services/api/notes.api'

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchNotes = async () => {
    try {
      setError(null)
      const data = await notesApi.list()
      setNotes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const createNote = async () => {
    if (!createName.trim()) return
    try {
      setCreating(true)
      setError(null)
      const note = await notesApi.create({ title: createName.trim() })
      setNotes((prev) => [note, ...prev])
      setCreateName('')
      setCreateOpen(false)
      router.push(`/app/notes/${note.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create note')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Notes"
        subtitle="Capture and share your ideas"
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-5 w-5" />
            New note
          </button>
        }
      />

      {error && (
        <div className="mb-6">
          <Toast message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setCreateName('') }} title="Create note">
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Give your note a name. You can add content by typing or recording after creating it.</p>
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Note title"
            className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50 font-medium"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && createNote()}
          />
          <div className="flex gap-2">
            <button
              onClick={createNote}
              disabled={creating || !createName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => { setCreateOpen(false); setCreateName('') }}
              className="px-4 py-2.5 rounded-lg bg-background-tertiary text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-14 w-14 text-primary/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No notes yet</h3>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
            Create a note to capture ideas, vocabulary, or recordings. Notes are shareable with others.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Create your first note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/app/notes/${note.id}`}
              className="card card-hover p-5 flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white truncate flex-1">{note.title}</h3>
                <FileText className="h-5 w-5 text-white/30 flex-shrink-0 group-hover:text-primary/50 transition-colors" />
              </div>
              <p className="text-white/50 text-sm line-clamp-2 flex-1 min-h-[2.5rem]">
                {note.content || 'No content yet — click to add'}
              </p>
              <p className="text-white/40 text-xs">{formatDate(note.updatedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
