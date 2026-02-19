'use client'

import { useState, useMemo } from 'react'
import { Search, X, Heart, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'All' },
  { id: 'alphabet', name: 'Alphabet' },
  { id: 'greetings', name: 'Greetings' },
  { id: 'common', name: 'Common' },
]

const signsData = [
  { id: '1', word: 'Hello', category: 'greetings', description: 'A friendly greeting' },
  { id: '2', word: 'Thank You', category: 'greetings', description: 'Express gratitude' },
  { id: '3', word: 'Yes', category: 'common', description: 'Affirmation' },
  { id: '4', word: 'No', category: 'common', description: 'Negation' },
  { id: '5', word: 'Help', category: 'common', description: 'Request assistance' },
  { id: '6', word: 'A', category: 'alphabet', description: 'Letter A' },
  { id: '7', word: 'B', category: 'alphabet', description: 'Letter B' },
]

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])

  const filteredSigns = useMemo(() => {
    return signsData.filter((sign) => {
      const matchesSearch =
        sign.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sign.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || sign.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <>
      <PageHeader title="Sign Dictionary" subtitle="Search and explore ASL / GSL signs" />

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

      {/* Signs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSigns.map((sign) => (
          <div key={sign.id} className="card card-hover p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-background-tertiary/80 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤟</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{sign.word}</p>
              <p className="text-white/60 text-sm truncate">{sign.description}</p>
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
  )
}
