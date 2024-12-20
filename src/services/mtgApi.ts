import axios from 'axios';

const API_BASE_URL = 'https://api.magicthegathering.io/v1';
const SCRYFALL_API = 'https://api.scryfall.com';

// Types
export interface MTGCard {
  id: string;
  name: string;
  manaCost?: string;
  cmc?: number;
  colors?: string[];
  type: string;
  types: string[];
  subtypes?: string[];
  rarity: string;
  set: string;
  setName: string;
  text?: string;
  imageUrl?: string;
  power?: string;
  toughness?: string;
}

export interface SearchOptions {
  name?: string;
  types?: string[];
  colors?: string[];
  rarity?: string;
  set?: string;
  page?: number;
  pageSize?: number;
}

class MTGService {
  private api;
  private scryfallApi;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.scryfallApi = axios.create({
      baseURL: SCRYFALL_API,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Search cards with better image quality from Scryfall
  async searchCards(options: SearchOptions): Promise<MTGCard[]> {
    try {
      let query = '';
      if (options.name) query += `name:/${options.name}/`;
      if (options.types?.length) query += ` type:${options.types.join(' ')}`;
      if (options.colors?.length) query += ` color:${options.colors.join('')}`;
      if (options.rarity) query += ` rarity:${options.rarity}`;
      if (options.set) query += ` set:${options.set}`;

      const response = await this.scryfallApi.get('/cards/search', {
        params: {
          q: query.trim(),
          page: options.page || 1,
          unique: 'cards',
          order: 'name',
        },
      });

      return response.data.data.map(this.transformScryfallCard);
    } catch (error) {
      console.error('Error searching cards:', error);
      return [];
    }
  }

  // Get single card details
  async getCard(id: string): Promise<MTGCard | null> {
    try {
      const response = await this.scryfallApi.get(`/cards/${id}`);
      return this.transformScryfallCard(response.data);
    } catch (error) {
      console.error('Error fetching card:', error);
      return null;
    }
  }

  // Get all sets
  async getSets() {
    try {
      const response = await this.api.get('/sets');
      return response.data.sets;
    } catch (error) {
      console.error('Error fetching sets:', error);
      return [];
    }
  }

  // Transform Scryfall card data to our format
  private transformScryfallCard(card: any): MTGCard {
    return {
      id: card.id,
      name: card.name,
      manaCost: card.mana_cost,
      cmc: card.cmc,
      colors: card.colors,
      type: card.type_line,
      types: card.type_line.split('—')[0].trim().split(' '),
      subtypes: card.type_line.includes('—') 
        ? card.type_line.split('—')[1].trim().split(' ')
        : [],
      rarity: card.rarity,
      set: card.set,
      setName: card.set_name,
      text: card.oracle_text,
      imageUrl: card.image_uris?.normal || card.image_uris?.large,
      power: card.power,
      toughness: card.toughness,
    };
  }
}

export const mtgService = new MTGService();
export default mtgService;