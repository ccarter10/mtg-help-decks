'use client'
import { useState } from 'react'

interface FilterOptions {
  colors: string[]
  types: string[]
  rarity: string | null
  cmc: number | null
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void
}

const COLORS = [
  { id: 'W', name: 'White', color: '#F9FAFB' },
  { id: 'U', name: 'Blue', color: '#3B82F6' },
  { id: 'B', name: 'Black', color: '#1F2937' },
  { id: 'R', name: 'Red', color: '#EF4444' },
  { id: 'G', name: 'Green', color: '#10B981' }
]

const TYPES = [
  'Creature',
  'Instant',
  'Sorcery',
  'Enchantment',
  'Artifact',
  'Planeswalker',
  'Land'
]

const RARITIES = [
  'common',
  'uncommon',
  'rare',
  'mythic'
]

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    colors: [],
    types: [],
    rarity: null,
    cmc: null
  })

  const handleColorToggle = (colorId: string) => {
    const newColors = filters.colors.includes(colorId)
      ? filters.colors.filter(c => c !== colorId)
      : [...filters.colors, colorId]

    const newFilters = { ...filters, colors: newColors }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]

    const newFilters = { ...filters, types: newTypes }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRarityChange = (rarity: string | null) => {
    const newFilters = { ...filters, rarity }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCmcChange = (cmc: number | null) => {
    const newFilters = { ...filters, cmc }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => handleColorToggle(color.id)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${filters.colors.includes(color.id)
                  ? 'border-purple-500 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color.color }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Card Types</h3>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`
                px-3 py-1 rounded-full border transition-all
                ${filters.types.includes(type)
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Rarity</h3>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map(rarity => (
            <button
              key={rarity}
              onClick={() => handleRarityChange(filters.rarity === rarity ? null : rarity)}
              className={`
                px-3 py-1 rounded-full border capitalize transition-all
                ${filters.rarity === rarity
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Mana Value</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, '7+'].map(value => (
            <button
              key={value}
              onClick={() => handleCmcChange(filters.cmc === Number(value) ? null : Number(value))}
              className={`
                w-8 h-8 rounded-full border transition-all
                ${filters.cmc === Number(value)
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          setFilters({ colors: [], types: [], rarity: null, cmc: null })
          onFilterChange({ colors: [], types: [], rarity: null, cmc: null })
        }}
        className="text-sm text-purple-600 hover:text-purple-800"
      >
        Clear Filters
      </button>
    </div>
  )
}