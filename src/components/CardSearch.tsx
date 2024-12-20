'use client'
import { useState } from 'react'
import { mtgService } from '@/services/mtgApi'
import type { MTGCard } from '@/services/mtgApi'

export default function CardSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cards, setCards] = useState<MTGCard[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await mtgService.searchCards({ name: searchTerm })
      setCards(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Search cards..."
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-purple-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id} className="border rounded p-4">
            {card.imageUrl && (
              <img src={card.imageUrl} alt={card.name} className="w-full mb-2" />
            )}
            <h3 className="font-bold">{card.name}</h3>
            <p className="text-sm text-gray-600">{card.type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}