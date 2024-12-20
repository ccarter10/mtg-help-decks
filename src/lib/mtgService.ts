const MTG_API_BASE = 'https://api.scryfall.com';

export type CardLegality = {
  standard: string;
  modern: string;
  commander: string;
};

export type CardInfo = {
  id: string;
  name: string;
  legalities: CardLegality;
};

// Cache card legality to avoid repeated API calls
const cardLegalityCache = new Map<string, CardLegality>();

export async function getCardLegality(cardId: string): Promise<CardLegality | null> {
  // Check cache first
  if (cardLegalityCache.has(cardId)) {
    return cardLegalityCache.get(cardId)!;
  }

  try {
    const response = await fetch(`${MTG_API_BASE}/cards/${cardId}`);
    if (!response.ok) {
      throw new Error('Card not found');
    }

    const cardData = await response.json();
    const legality = cardData.legalities;
    
    // Cache the result
    cardLegalityCache.set(cardId, legality);
    
    return legality;
  } catch (error) {
    console.error(`Error fetching card legality for ${cardId}:`, error);
    return null;
  }
}

export async function checkDeckLegality(cards: Array<{ id: string; quantity: number }>, format: string): Promise<{
  isLegal: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  for (const card of cards) {
    const legality = await getCardLegality(card.id);
    
    if (!legality) {
      errors.push(`Could not verify legality for card ID: ${card.id}`);
      continue;
    }

    const formatLegality = legality[format as keyof CardLegality];
    if (formatLegality !== 'legal') {
      errors.push(`Card ${card.id} is not legal in ${format} (status: ${formatLegality})`);
    }
  }

  return {
    isLegal: errors.length === 0,
    errors
  };
}

export async function searchCard(query: string): Promise<CardInfo[]> {
  try {
    const response = await fetch(
      `${MTG_API_BASE}/cards/search?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data.data.map((card: any) => ({
      id: card.id,
      name: card.name,
      legalities: card.legalities
    }));
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}