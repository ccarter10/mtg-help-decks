import { checkDeckLegality } from './mtgService';

type Card = {
  id: string;
  name: string;
  quantity: number;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

const FORMAT_RULES = {
  standard: {
    minCards: 60,
    maxCards: undefined,
    maxCopies: 4,
    maxCopiesBasicLand: undefined,
  },
  commander: {
    minCards: 100,
    maxCards: 100,
    maxCopies: 1,
    maxCopiesBasicLand: undefined,
    requiresCommander: true,
  },
  modern: {
    minCards: 60,
    maxCards: undefined,
    maxCopies: 4,
    maxCopiesBasicLand: undefined,
  }
} as const;

export async function validateDeck(cards: Card[], format: keyof typeof FORMAT_RULES): Promise<ValidationResult> {
  const rules = FORMAT_RULES[format];
  const errors: string[] = [];

  // Basic deck construction rules
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);

  if (totalCards < rules.minCards) {
    errors.push(`Deck must contain at least ${rules.minCards} cards`);
  }

  if (rules.maxCards && totalCards > rules.maxCards) {
    errors.push(`Deck must contain no more than ${rules.maxCards} cards`);
  }

  // Check card copies
  const cardCounts = new Map<string, number>();
  cards.forEach(card => {
    const currentCount = cardCounts.get(card.id) || 0;
    cardCounts.set(card.id, currentCount + card.quantity);
  });

  cardCounts.forEach((count, cardId) => {
    if (count > rules.maxCopies) {
      const card = cards.find(c => c.id === cardId);
      errors.push(`Deck contains more than ${rules.maxCopies} copies of ${card?.name}`);
    }
  });

  // Check card legality
  const legalityCheck = await checkDeckLegality(cards, format);
  errors.push(...legalityCheck.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isValidFormat(format: string): format is keyof typeof FORMAT_RULES {
  return format in FORMAT_RULES;
}