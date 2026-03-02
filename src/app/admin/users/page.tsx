'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { Search, MoreVertical, Shield, Crown, User } from 'lucide-react'

interface UserRow {
  id: string
  email: string
  name: string
  image?: string
  subscriptionPlan: string
  isAdmin: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<UserRow | null>(null)
  const [editPlan, setEditPlan] = useState<string>('')
  const [editAdmin, setEditAdmin] = useState<boolean>(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await apiClient.get<{
        success: boolean
        data: UserRow[]
        pagination: { page: number; total: number; totalPages: number }
      }>(`${API_ENDPOINTS.ADMIN.USERS}?page=${page}&search=${encodeURIComponent(search)}`)
      if (data.success) {
        setUsers(data.data || [])
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 })
      }
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(pagination.page)
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1)
  }

  const openEditModal = (u: UserRow) => {
    setEditModal(u)
    setEditPlan(u.subscriptionPlan)
    setEditAdmin(u.isAdmin)
    setMenuOpen(null)
  }

  const handleSaveUser = async () => {
    if (!editModal) return
    setSaving(true)
    setError(null)
    try {
      await apiClient.patch(
        API_ENDPOINTS.ADMIN.USER_SUBSCRIPTION(editModal.id),
        { subscriptionPlan: editPlan }
      )
      await apiClient.patch(
        API_ENDPOINTS.ADMIN.USER_ADMIN(editModal.id),
        { isAdmin: editAdmin }
      )
      setSuccess('User updated')
      setTimeout(() => setSuccess(null), 3000)
      setEditModal(null)
      fetchUsers(pagination.page)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-secondary border border-background-tertiary text-white placeholder:text-white/40 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark"
          >
            Search
          </button>
        </form>
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
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">User</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Plan</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Role</th>
                  <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Joined</th>
                  <th className="w-12 py-4 px-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-background-tertiary/50 last:border-0 hover:bg-background-tertiary/20 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {u.image ? (
                            <img src={u.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name || '—'}</p>
                          <p className="text-white/60 text-sm">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                          u.subscriptionPlan === 'premium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-background-tertiary text-white/60'
                        }`}
                      >
                        {u.subscriptionPlan === 'premium' && <Crown className="h-3.5 w-3.5" />}
                        {u.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                          u.isAdmin ? 'bg-primary/20 text-primary' : 'bg-background-tertiary text-white/60'
                        }`}
                      >
                        {u.isAdmin && <Shield className="h-3.5 w-3.5" />}
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/60 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                          className="p-2 rounded-lg text-white/60 hover:bg-background-tertiary hover:text-white"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {menuOpen === u.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 py-1 rounded-lg bg-background-secondary border border-background-tertiary shadow-xl z-20 min-w-[160px]">
                              <button
                                onClick={() => openEditModal(u)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-background-tertiary text-left text-sm"
                              >
                                Manage user
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-background-tertiary">
              <p className="text-white/60 text-sm">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal ? `Manage ${editModal.name || editModal.email}` : 'Manage user'}
      >
        {editModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-tertiary">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                {editModal.image ? (
                  <img src={editModal.image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{editModal.name || '—'}</p>
                <p className="text-white/60 text-sm">{editModal.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Subscription plan</label>
              <select
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Role</label>
              <select
                value={editAdmin ? 'admin' : 'user'}
                onChange={(e) => setEditAdmin(e.target.value === 'admin')}
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white outline-none focus:border-primary/50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-3 rounded-lg bg-background-tertiary text-white/80 hover:bg-background-elevated"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving || (editPlan === editModal.subscriptionPlan && editAdmin === editModal.isAdmin)}
                className="flex-1 py-3 rounded-lg bg-primary text-background font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
