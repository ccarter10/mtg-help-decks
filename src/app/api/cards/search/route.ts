import { NextRequest, NextResponse } from 'next/server'

const SCRYFALL_API = 'https://api.scryfall.com'

interface ScryfallCard {
  id: string
  name: string
  type_line: string
  oracle_text: string
  mana_cost?: string
  colors?: string[]
  rarity: string
  set_name: string
  image_uris?: {
    normal: string
    small: string
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const format = searchParams.get('format')
    const colors = searchParams.get('colors')?.split(',')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Build Scryfall query
    let scryfallQuery = query
    if (format) {
      scryfallQuery += ` format:${format}`
    }
    if (colors?.length) {
      scryfallQuery += ` color:${colors.join('')}`
    }

    const response = await fetch(
      `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(scryfallQuery)}&order=name`
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ cards: [] })
      }
      throw new Error('Failed to fetch cards')
    }

    const data = await response.json()
    
    // Transform Scryfall data to our format
    const cards = data.data.map((card: ScryfallCard) => ({
      id: card.id,
      name: card.name,
      type: card.type_line,
      text: card.oracle_text,
      manaCost: card.mana_cost,
      colors: card.colors,
      rarity: card.rarity,
      set: card.set_name,
      imageUrls: card.image_uris,
    }))

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Card search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}