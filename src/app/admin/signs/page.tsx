'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Sign {
  id: string
  word: string
  language: string
  category: string
  difficulty: string
  description?: string
  thumbnail?: string
}

export default function AdminSignsPage() {
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState<Sign | null>(null)
  const [deleteModal, setDeleteModal] = useState<Sign | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    word: '',
    category: '',
    description: '',
    image: '',
  })
  const [editForm, setEditForm] = useState({
    word: '',
    category: '',
    description: '',
    image: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSigns = () => {
    apiClient
      .get<{ success: boolean; data: Sign[] }>(`${API_ENDPOINTS.SIGNS.LIST}?limit=100`)
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
    if (!form.word.trim() || !form.category.trim() || !form.image) {
      setError('Word, category, and image are required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN.SIGNS, {
        word: form.word.trim(),
        category: form.category.trim(),
        description: form.description.trim() || '',
        thumbnail: form.image,
      })
      setForm({ word: '', category: '', description: '', image: '' })
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

  const openEditModal = (sign: Sign) => {
    setEditModal(sign)
    setEditForm({
      word: sign.word,
      category: sign.category,
      description: sign.description || '',
      image: sign.thumbnail || '',
    })
  }

  const updateSign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    if (!editForm.word.trim() || !editForm.category.trim() || !editForm.image) {
      setError('Word, category, and image are required')
      return
    }
    setUpdating(true)
    setError(null)
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN.SIGN(editModal.id), {
        word: editForm.word.trim(),
        category: editForm.category.trim(),
        description: editForm.description.trim() || '',
        thumbnail: editForm.image,
      })
      setEditModal(null)
      setSuccess('Sign updated')
      setTimeout(() => setSuccess(null), 3000)
      fetchSigns()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update sign')
    } finally {
      setUpdating(false)
    }
  }

  const deleteSign = async () => {
    if (!deleteModal) return
    setDeleting(true)
    setError(null)
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.SIGN(deleteModal.id))
      setDeleteModal(null)
      setSuccess('Sign deleted')
      setTimeout(() => setSuccess(null), 3000)
      fetchSigns()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete sign')
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setForm({ word: '', category: '', description: '', image: '' })
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
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Preview</th>
                  <th className="text-right py-4 px-4 text-white/60 font-medium text-sm w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signs.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-background-tertiary/50 last:border-0 hover:bg-background-tertiary/20 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-white">{s.word}</td>
                    <td className="py-4 px-4 text-white/80">{s.category}</td>
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
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 rounded-lg text-white/60 hover:text-primary hover:bg-primary/10"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(s)}
                          className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        className="max-w-md"
      >
        <form onSubmit={createSign} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Word</label>
            <input
              value={form.word}
              onChange={(e) => setForm((p) => ({ ...p, word: e.target.value }))}
              placeholder="e.g. Hello"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              placeholder="e.g. Greetings"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((p) => ({ ...p, image: url }))}
            label="Image"
          />
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the sign"
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
              disabled={creating || !form.image}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add sign'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit sign" className="max-w-md">
        {editModal && (
          <form onSubmit={updateSign} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Word</label>
              <input
                value={editForm.word}
                onChange={(e) => setEditForm((p) => ({ ...p, word: e.target.value }))}
                placeholder="e.g. Hello"
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
              <input
                value={editForm.category}
                onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Greetings"
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
                required
              />
            </div>
            <ImageUpload value={editForm.image} onChange={(url) => setEditForm((p) => ({ ...p, image: url }))} label="Image" />
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the sign"
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="submit" disabled={updating || !editForm.image} className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50">
                {updating ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete sign">
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-white/80">
              Are you sure you want to delete <strong className="text-white">{deleteModal.word}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="button" onClick={deleteSign} disabled={deleting} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
