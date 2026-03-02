import { API_BASE_URL } from '@/config/api'
import { getAuthToken } from '@/lib/storage'

const TRANSCRIBE_URL = `${API_BASE_URL}/translate/transcribe`
const TRANSCRIPTS_URL = `${API_BASE_URL}/transcripts`

export interface Transcript {
  id: string
  rawText: string
  processedText: string | null
  sourceType: string
  createdAt: string
}

export const transcriptApi = {
  transcribe: async (audioBlob: Blob, processAs: 'raw' | 'rearranged' = 'raw'): Promise<{ text: string; rawText: string; transcriptId: string }> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in to transcribe')

    const formData = new FormData()
    const extension = audioBlob.type.includes('webm') ? 'webm' : 'mp4'
    formData.append('audio', audioBlob, `recording.${extension}`)
    formData.append('processAs', processAs)

    const res = await fetch(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || `Transcription failed (${res.status})`)
    }

    const data = await res.json()
    if (data.success && data.data) return data.data
    throw new Error(data.message || 'Transcription failed')
  },

  getTranscripts: async (): Promise<Transcript[]> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in to fetch transcripts')

    const res = await fetch(`${TRANSCRIPTS_URL}?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to fetch transcripts')
    }

    const data = await res.json()
    return data.data || []
  },

  deleteTranscript: async (id: string): Promise<void> => {
    const token = getAuthToken()
    if (!token) throw new Error('You must be logged in to delete transcripts')

    const res = await fetch(`${TRANSCRIPTS_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to delete transcript')
    }
  },
}
