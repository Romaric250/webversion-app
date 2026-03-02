'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, X, Heart, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'

interface Sign {
  id: string
  word: string
  category: string
  description?: string
  thumbnail?: string
}

export default function DictionaryPage() {
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const fetchSigns = async () => {
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
    }
    fetchSigns()
  }, [])

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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <>
      <PageHeader title="Sign Dictionary" subtitle="Search and explore GSL signs" />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signs..."
            className="w-full pl-12 pr-12 py-3 rounded-lg bg-background-secondary border border-background-tertiary text-white placeholder:text-white/40 text-sm outline-none focus:border-primary/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-primary text-background'
                : 'bg-background-secondary text-white/80 border border-background-tertiary hover:border-white/30 hover:text-white'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="text-white/60 text-sm mb-4">{filteredSigns.length} signs found</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Signs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSigns.map((sign) => (
              <div key={sign.id} className="card card-hover p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-background-tertiary/80 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {sign.thumbnail ? (
                    <img src={sign.thumbnail} alt={sign.word} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🤟</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{sign.word}</p>
                  <p className="text-white/60 text-sm truncate">{sign.description || sign.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleFavorite(sign.id)}
                    className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Heart className={cn('h-5 w-5', favorites.includes(sign.id) && 'fill-red-400 text-red-400')} />
                  </button>
                  <ChevronRight className="h-5 w-5 text-white/40" />
                </div>
              </div>
            ))}
          </div>

          {filteredSigns.length === 0 && (
            <div className="card p-12 text-center">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/80 font-medium">No signs found</p>
              <p className="text-white/50 text-sm mt-1">Try a different search term or category</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
