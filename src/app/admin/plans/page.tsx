'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Plan } from '@/components/PlansModal'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<Plan | null>(null)
  const [deleteModal, setDeleteModal] = useState<Plan | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', priceCedis: 0, features: '' })
  const [editForm, setEditForm] = useState({ name: '', slug: '', priceCedis: 0, features: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchPlans = () => {
    apiClient
      .get<{ success: boolean; data: Plan[] }>(API_ENDPOINTS.ADMIN.PLANS)
      .then((res) => {
        if (res.data.success) setPlans(res.data.data || [])
      })
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return
    setCreating(true)
    setError(null)
    try {
      const features = form.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      await apiClient.post(API_ENDPOINTS.ADMIN.PLANS, {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        priceCedis: Number(form.priceCedis) || 0,
        features,
      })
      setForm({ name: '', slug: '', priceCedis: 0, features: '' })
      setCreateModal(false)
      setSuccess('Plan created')
      setTimeout(() => setSuccess(null), 3000)
      fetchPlans()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create plan')
    } finally {
      setCreating(false)
    }
  }

  const openEditModal = (p: Plan) => {
    setEditModal(p)
    setEditForm({
      name: p.name,
      slug: p.slug,
      priceCedis: p.priceCedis,
      features: Array.isArray(p.features) ? p.features.join('\n') : '',
    })
  }

  const updatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    setUpdating(true)
    setError(null)
    try {
      const features = editForm.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      await apiClient.patch(API_ENDPOINTS.ADMIN.PLAN(editModal.id), {
        name: editForm.name.trim(),
        slug: editForm.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        priceCedis: Number(editForm.priceCedis) || 0,
        features,
      })
      setEditModal(null)
      setSuccess('Plan updated')
      setTimeout(() => setSuccess(null), 3000)
      fetchPlans()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update plan')
    } finally {
      setUpdating(false)
    }
  }

  const deletePlan = async () => {
    if (!deleteModal) return
    setDeleting(true)
    setError(null)
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.PLAN(deleteModal.id))
      setDeleteModal(null)
      setSuccess('Plan deleted')
      setTimeout(() => setSuccess(null), 3000)
      fetchPlans()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete plan')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Plans</h1>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Add plan
        </button>
      </div>

      {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <Toast type="success" message={success} onDismiss={() => setSuccess(null)} />}

      {loading ? (
        <div className="py-12 text-center text-white/60">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="py-12 text-center text-white/60 rounded-xl bg-background-secondary border border-background-tertiary">
          No plans yet. Add one to get started. Ensure you have a &quot;free&quot; plan for new users.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-background-secondary border border-background-tertiary"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  <p className="text-primary font-bold mt-1">
                    {p.priceCedis === 0 ? 'Free' : `GHS ${p.priceCedis}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-lg text-white/60 hover:text-primary hover:bg-primary/10"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(p)}
                    className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {Array.isArray(p.features) && p.features.length > 0 && (
                <ul className="mt-3 text-sm text-white/70 space-y-1">
                  {p.features.slice(0, 3).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                  {p.features.length > 3 && (
                    <li className="text-white/50">+{p.features.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create plan">
        <form onSubmit={createPlan} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Free, Basic, Premium"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="e.g. free, basic, premium"
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 outline-none focus:border-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Price (GHS Cedis)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.priceCedis}
              onChange={(e) => setForm((p) => ({ ...p, priceCedis: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
              placeholder="Feature 1&#10;Feature 2"
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white placeholder:text-white/40 resize-none outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit plan">
        {editModal && (
          <form onSubmit={updatePlan} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Slug</label>
              <input
                value={editForm.slug}
                onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Price (GHS Cedis)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={editForm.priceCedis}
                onChange={(e) => setEditForm((p) => ({ ...p, priceCedis: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Features (one per line)</label>
              <textarea
                value={editForm.features}
                onChange={(e) => setEditForm((p) => ({ ...p, features: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white resize-none outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="submit" disabled={updating} className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50">
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete plan">
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-white/80">
              Delete <strong className="text-white">{deleteModal.name}</strong>? Users on this plan will need to be reassigned.
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated">
                Cancel
              </button>
              <button type="button" onClick={deletePlan} disabled={deleting} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
