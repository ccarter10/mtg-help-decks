'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeckStats from '@/components/DeckStats'
import { searchCards } from '@/lib/cardSearch'
import type { Card, Deck } from '@/types/types'

export default function DeckPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Card[]>([])
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    async function fetchDeck() {
      try {
        const response = await fetch(`/api/decks/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch deck')
        const data = await response.json()
        setDeck(data)
      } catch (err) {
        setError('Error loading deck')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDeck()
  }, [params.id])

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.length < 2) {
      setSearchResults([])
      return
    }

    const results = await searchCards(value)
    if (!results) return setSearchResults([])

    setSearchResults(results)
  }

  const handleAddCard = async (card: Card) => {
    if (!deck) return

    try {
      const updatedCards = [...deck.cards]
      const existingCard = updatedCards.find(c => c.id === card.id)

      if (existingCard) {
        existingCard.quantity += 1
      } else {
        updatedCards.push({ ...card, quantity: 1 })
      }

      const response = await fetch(`/api/decks/${deck.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deck,
          cards: updatedCards,
        }),
      })

      if (!response.ok) throw new Error('Failed to update deck')
      
      const updatedDeck = await response.json()
      setDeck(updatedDeck)
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      console.error('Error adding card:', err)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  }

  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  if (!deck) return <div className="text-gray-500 text-center py-8">Deck not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{deck.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deck List and Stats */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Deck List</h2>
          </div>

          <DeckStats cards={deck.cards} />
          
          <div className="mt-4 space-y-2">
            {deck.cards.map((card) => (
              <div
                key={card.id}
                className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
              >
                <span>{card.quantity}x {card.name}</span>
              </div>
            ))}
            {deck.cards.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No cards in deck yet
              </p>
            )}
          </div>
        </div>

        {/* Card Search */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Add Cards</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search for cards..."
              className="w-full p-2 border rounded-lg"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchResults.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex gap-4">
                      {card.imageUrl && (
                        <div className="w-40 flex-shrink-0">
                          <img 
                            src={card.imageUrl} 
                            alt={card.name}
                            className="w-full h-auto rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{card.name}</h3>
                          <p className="text-sm text-gray-600">{card.type}</p>
                          {card.manaCost && (
                            <p className="text-sm text-gray-500">{card.manaCost}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddCard(card)}
                          className="self-end mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Add to Deck
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}