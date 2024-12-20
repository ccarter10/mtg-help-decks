export interface Card {
    id: string;
    name: string;
    type: string;
    manaCost?: string;
    quantity: number;
    colors: string[];     // Changed from optional to required
    rarity: string;       // Changed from optional to required
    produced_mana?: string[];
    oracle_text?: string;
    imageUrl?: string;
  }
  
  export interface Deck {
    id: string;
    name: string;
    description: string;
    format: string;
    cards: Card[];
    user: {
      username: string;
    }
  }
  
  export interface FilterOptions {
    colors: string[];
    types: string[];
    rarity: string | null;
    cmc: number | null;
  }