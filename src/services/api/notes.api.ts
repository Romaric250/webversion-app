import { API_BASE_URL } from '@/config/api'
import { getAuthToken } from '@/lib/storage'

const NOTES_URL = `${API_BASE_URL}/notes`

export interface Note {
  id: string
  title: string
  content: string
  rawContent: string | null
  processedContent: string | null
  sourceType: 'typed' | 'recorded'
  createdAt: string
  updatedAt: string
}

export const notesApi = {
  list: async (): Promise<Note[]> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(`${NOTES_URL}?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to fetch notes')
    }
    const data = await res.json()
    return data.data || []
  },

  create: async (payload: { title: string; content?: string; processAs?: 'raw' | 'rearranged' }): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(NOTES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.title,
        content: payload.content ?? '',
        sourceType: 'typed',
        processAs: payload.processAs || 'raw',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to create note')
    }
    const data = await res.json()
    return data.data
  },

  getById: async (id: string): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(`${NOTES_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to fetch note')
    }
    const data = await res.json()
    return data.data
  },

  addRecordingToNote: async (
    id: string,
    audioBlob: Blob,
    payload: { processAs?: 'raw' | 'rearranged' }
  ): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const formData = new FormData()
    // Append fields before file so multer always parses processAs
    formData.append('processAs', payload.processAs || 'raw')
    formData.append('audio', audioBlob, 'recording.webm')
    const res = await fetch(`${NOTES_URL}/${id}/from-recording`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to add recording')
    }
    const data = await res.json()
    return data.data
  },

  createFromRecording: async (
    audioBlob: Blob,
    payload: { title: string; processAs?: 'raw' | 'rearranged' }
  ): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('processAs', payload.processAs || 'raw')
    formData.append('audio', audioBlob, 'recording.webm')
    const res = await fetch(`${NOTES_URL}/from-recording`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to create note')
    }
    const data = await res.json()
    return data.data
  },

  update: async (id: string, payload: { title?: string; content?: string }): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(`${NOTES_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to update note')
    }
    const data = await res.json()
    return data.data
  },

  rewrite: async (id: string, options?: { useRaw?: boolean }): Promise<Note> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(`${NOTES_URL}/${id}/rewrite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useRaw: options?.useRaw ?? false }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to improve text')
    }
    const data = await res.json()
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in')
    const res = await fetch(`${NOTES_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to delete note')
    }
  },
}
