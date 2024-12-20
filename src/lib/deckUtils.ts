import type { Card, Deck } from '@/types/types'

export function exportDeckToText(deck: Deck): string {
  const lines = [
    `// ${deck.name}`,
    deck.description && `// ${deck.description}`,
    `// Format: ${deck.format}`,
    '',
    '// Main Deck',
    ...deck.cards
      .sort((a, b) => {
        // Sort by card type, then name
        if (a.type !== b.type) return a.type.localeCompare(b.type)
        return a.name.localeCompare(b.name)
      })
      .map(card => `${card.quantity} ${card.name}`),
  ]

  return lines.filter(Boolean).join('\n')
}

export function exportDeckToCSV(deck: Deck): string {
  const headers = ['Quantity', 'Name', 'Type', 'Mana Cost']
  const rows = [
    headers.join(','),
    ...deck.cards.map(card => 
      [
        card.quantity,
        `"${card.name}"`,
        `"${card.type}"`,
        `"${card.manaCost || ''}"`
      ].join(',')
    )
  ]

  return rows.join('\n')
}

export async function importDeckFromText(text: string): Promise<Partial<Deck>> {
  const lines = text.split('\n').map(line => line.trim())
  const cards: Card[] = []
  let name = 'Imported Deck'
  let description = ''
  let format = 'standard'

  for (const line of lines) {
    if (line.startsWith('//')) {
      // Parse metadata
      const meta = line.slice(2).trim()
      if (meta.startsWith('Format:')) {
        format = meta.slice(7).trim().toLowerCase()
      } else if (!description) {
        description = meta
      } else if (name === 'Imported Deck') {
        name = meta
      }
      continue
    }

    if (!line || line.toLowerCase().includes('sideboard')) continue

    const match = line.match(/^(\d+)\s+(.+)$/)
    if (match) {
      const [_, quantity, cardName] = match
      cards.push({
        id: `temp-${cards.length}`,
        name: cardName,
        quantity: parseInt(quantity, 10),
        type: '',
        colors: [],
        rarity: 'unknown',
        manaCost: '',
        oracle_text: '',
        imageUrl: '',
        produced_mana: []
      })
    }
  }

  return {
    name,
    description,
    format,
    cards,
  }
}

export async function fetchCardDetails(cardName: string): Promise<Card | null> {
  try {
    const response = await fetch(`/api/cards/search?name=${encodeURIComponent(cardName)}`);
    if (!response.ok) return null;
    const cards = await response.json();
    return cards[0] || null;
  } catch (error) {
    console.error('Error fetching card details:', error);
    return null;
  }
}

export async function enrichImportedDeck(deck: Partial<Deck>): Promise<Partial<Deck>> {
  if (!deck.cards) return deck;

  const enrichedCards = await Promise.all(
    deck.cards.map(async (card) => {
      const details = await fetchCardDetails(card.name);
      if (details) {
        return {
          ...details,
          quantity: card.quantity
        };
      }
      return card;
    })
  );

  return {
    ...deck,
    cards: enrichedCards,
  };
}