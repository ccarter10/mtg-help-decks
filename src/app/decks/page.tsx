'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deck {
  id: string
  name: string
  description: string
  format: string
  user: {
    username: string
  }
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDecks() {
      try {
        const response = await fetch('/api/decks')
        if (!response.ok) throw new Error('Failed to fetch decks')
        const data = await response.json()
        setDecks(data)
      } catch (err) {
        setError('Error loading decks')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDecks()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  )

  if (error) return (
    <div className="text-center py-8 text-red-500">
      {error}
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deck Collection</h1>
        <Link 
          href="/decks/new" 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Create New Deck
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Link key={deck.id} href={`/decks/${deck.id}`}>
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{deck.name}</h2>
              <p className="text-gray-600 mb-2">{deck.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>by {deck.user.username}</span>
                <span>{deck.format}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No decks found. Create your first deck!
        </div>
      )}
    </div>
  )
}