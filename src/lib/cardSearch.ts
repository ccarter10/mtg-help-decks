import debounce from 'lodash/debounce'
import type { Card, MTGAPIResponse } from '@/types/types'

const transformApiResponse = (result: MTGAPIResponse): Card => ({
  id: result.id || `temp-${Math.random()}`,
  name: result.name,
  type: result.type || '',
  manaCost: result.manaCost,
  quantity: 1,
  colors: result.colors || [],
  rarity: result.rarity || 'unknown',
  produced_mana: result.produced_mana || [],
  oracle_text: result.oracle_text || '',
  imageUrl: result.imageUrl || ''
})

export const searchCards = debounce(async (query: string): Promise<Card[]> => {
  if (!query) return []
  
  try {
    const response = await fetch(`/api/cards/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Search failed')
    const results: MTGAPIResponse[] = await response.json()
    return results.map(transformApiResponse)
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}, 300)