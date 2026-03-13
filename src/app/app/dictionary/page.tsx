'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X, Heart, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'
import { useAuthStore } from '@/store/authStore'

interface Sign {
  id: string
  word: string
  category: string
  description?: string
  thumbnail?: string
  videoUrl?: string
}

export default function DictionaryPage() {
  const { isAuthenticated } = useAuthStore()
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedSign, setSelectedSign] = useState<Sign | null>(null)
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)

  const fetchSigns = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Sign[] }>(
        `${API_ENDPOINTS.SIGNS.LIST}?limit=200`
      )
      if (data.success) setSigns(data.data || [])
    } catch {
      setSigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([])
      return
    }
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Sign[] }>(
        API_ENDPOINTS.SIGNS.FAVORITES + '/all'
      )
      if (data.success && data.data) {
        setFavorites(data.data.map((s) => s.id))
      }
    } catch {
      setFavorites([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchSigns()
  }, [fetchSigns])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const categories = useMemo(() => {
    const cats = new Set(signs.map((s) => s.category).filter(Boolean))
    return [
      { id: 'all', name: 'All' },
      ...Array.from(cats).map((c) => ({ id: c.toLowerCase(), name: c })),
    ]
  }, [signs])

  const filteredSigns = useMemo(() => {
    return signs.filter((sign) => {
      const matchesSearch =
        sign.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sign.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || sign.category?.toLowerCase() === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [signs, searchQuery, selectedCategory])

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    setTogglingFavorite(id)
    try {
      const isFav = favorites.includes(id)
      if (isFav) {
        await apiClient.delete(`${API_ENDPOINTS.SIGNS.FAVORITES}/${id}`)
        setFavorites((prev) => prev.filter((x) => x !== id))
      } else {
        await apiClient.post(API_ENDPOINTS.SIGNS.FAVORITES, { signId: id })
        setFavorites((prev) => [...prev, id])
      }
    } catch {
      // Revert on error
      setFavorites((prev) =>
        favorites.includes(id) ? prev : prev.filter((x) => x !== id)
      )
    } finally {
      setTogglingFavorite(null)
    }
  }

  return (
    <>
      <PageHeader title="Sign Dictionary" subtitle="Search and explore GSL signs" />

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/50" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signs..."
            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg bg-background-secondary border border-background-tertiary text-white placeholder:text-white/40 text-sm outline-none focus:border-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
              selectedCategory === cat.id
                ? 'bg-primary text-background'
                : 'bg-background-secondary text-white/80 border border-background-tertiary hover:border-white/30 hover:text-white'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">{filteredSigns.length} signs found</p>

      {loading ? (
        <div className="flex justify-center py-12 sm:py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Signs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredSigns.map((sign) => (
              <div
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className="card card-hover p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-background-tertiary/80 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {sign.thumbnail ? (
                    <img src={sign.thumbnail} alt={sign.word} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl sm:text-2xl">🤟</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm sm:text-base truncate">{sign.word}</p>
                  <p className="text-white/60 text-xs sm:text-sm truncate">{sign.description || sign.category}</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => toggleFavorite(e, sign.id)}
                    disabled={!isAuthenticated || togglingFavorite === sign.id}
                    className="p-1.5 sm:p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        favorites.includes(sign.id) && 'fill-red-400 text-red-400'
                      )}
                    />
                  </button>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/40" />
                </div>
              </div>
            ))}
          </div>

          {filteredSigns.length === 0 && (
            <div className="card p-8 sm:p-12 text-center">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-white/30 mx-auto mb-3 sm:mb-4" />
              <p className="text-white/80 font-medium text-sm sm:text-base">No signs found</p>
              <p className="text-white/50 text-xs sm:text-sm mt-1">Try a different search term or category</p>
            </div>
          )}
        </>
      )}

      {/* Sign detail popup */}
      <Modal
        isOpen={!!selectedSign}
        onClose={() => setSelectedSign(null)}
        title={selectedSign?.word || ''}
        className="max-w-lg"
      >
        {selectedSign && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-background-tertiary aspect-square max-h-80 mx-auto">
              {selectedSign.thumbnail ? (
                <img
                  src={selectedSign.thumbnail}
                  alt={selectedSign.word}
                  className="w-full h-full object-contain"
                />
              ) : selectedSign.videoUrl ? (
                <video
                  src={selectedSign.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🤟</div>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm">{selectedSign.description}</p>
              <p className="text-white/50 text-xs mt-1">{selectedSign.category}</p>
            </div>
            <button
              onClick={(e) => toggleFavorite(e, selectedSign.id)}
              disabled={!isAuthenticated || togglingFavorite === selectedSign.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background-tertiary text-white/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Heart
                className={cn('h-5 w-5', favorites.includes(selectedSign.id) && 'fill-red-400 text-red-400')}
              />
              {favorites.includes(selectedSign.id) ? 'Remove from favorites' : 'Add to favorites'}
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}
