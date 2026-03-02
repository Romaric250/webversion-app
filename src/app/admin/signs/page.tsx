'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { VideoUpload } from '@/components/admin/VideoUpload'
import { Plus } from 'lucide-react'

interface Sign {
  id: string
  word: string
  language: string
  category: string
  difficulty: string
  videoUrl?: string
  thumbnail?: string
}

export default function AdminSignsPage() {
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    word: '',
    language: 'ASL',
    category: '',
    difficulty: 'beginner',
    videoUrl: '',
    thumbnail: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSigns = () => {
    apiClient
      .get<{ success: boolean; data: Sign[] }>(API_ENDPOINTS.SIGNS.LIST)
      .then((res) => {
        if (res.data.success) setSigns(res.data.data || [])
      })
      .catch(() => setError('Failed to load signs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSigns()
  }, [])

  const createSign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.word.trim() || !form.videoUrl || !form.thumbnail) {
      setError('Word, video URL, and thumbnail are required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN.SIGNS, {
        ...form,
        description: form.description || '',
      })
      setForm({
        word: '',
        language: 'ASL',
        category: '',
        difficulty: 'beginner',
        videoUrl: '',
        thumbnail: '',
        description: '',
      })
      setAddModal(false)
      setSuccess('Sign added')
      setTimeout(() => setSuccess(null), 3000)
      fetchSigns()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add sign')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setForm({
      word: '',
      language: 'ASL',
      category: '',
      difficulty: 'beginner',
      videoUrl: '',
      thumbnail: '',
      description: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Dictionary (Signs)</h1>
        <button
          onClick={() => {
            resetForm()
            setAddModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          Add sign
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
      {success && <Toast message={success} type="success" onDismiss={() => setSuccess(null)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="rounded-xl bg-background-secondary border border-background-tertiary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-background-tertiary bg-background-tertiary/30">
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Word</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Language</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Difficulty</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Preview</th>
                </tr>
              </thead>
              <tbody>
                {signs.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-background-tertiary/50 last:border-0 hover:bg-background-tertiary/20 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-white">{s.word}</td>
                    <td className="py-4 px-4 text-white/80">{s.language}</td>
                    <td className="py-4 px-4 text-white/80">{s.category}</td>
                    <td className="py-4 px-4 text-white/80 capitalize">{s.difficulty}</td>
                    <td className="py-4 px-4">
                      {s.thumbnail ? (
                        <img
                          src={s.thumbnail}
                          alt={s.word}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-white/40 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add sign"
        className="max-w-lg"
      >
        <form onSubmit={createSign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Word</label>
              <input
                value={form.word}
                onChange={(e) => setForm((p) => ({ ...p, word: e.target.value }))}
                placeholder="Word"
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
              >
                <option value="ASL">ASL</option>
                <option value="BSL">BSL</option>
                <option value="GSL">GSL</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <VideoUpload
            value={form.videoUrl}
            onChange={(url) => setForm((p) => ({ ...p, videoUrl: url }))}
            label="Video"
            placeholder="Upload sign video"
          />
          <ImageUpload
            value={form.thumbnail}
            onChange={(url) => setForm((p) => ({ ...p, thumbnail: url }))}
            label="Thumbnail"
            placeholder="Upload thumbnail"
          />

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add sign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
