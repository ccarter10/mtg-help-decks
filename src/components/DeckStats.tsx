'use client'
import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface Card {
  id: string
  name: string
  type: string
  manaCost?: string
  colors?: string[]
  rarity?: string
  quantity: number
}

interface DeckStatsProps {
  cards: Card[]
}

const COLORS = {
  Creature: '#4CAF50',
  Instant: '#2196F3',
  Sorcery: '#9C27B0',
  Enchantment: '#FF9800',
  Artifact: '#795548',
  Land: '#607D8B',
  Other: '#9E9E9E'
}

const RARITY_COLORS = {
  common: '#95A5A6',
  uncommon: '#BDC3C7',
  rare: '#F1C40F',
  mythic: '#E74C3C'
}

const COLOR_MAP = {
  White: '#F9FAFB',
  Blue: '#3B82F6',
  Black: '#1F2937',
  Red: '#EF4444',
  Green: '#10B981',
  Colorless: '#6B7280'
}

export default function DeckStats({ cards }: DeckStatsProps) {
  const statistics = useMemo(() => {
    const stats = {
      totalCards: 0,
      typeDistribution: {} as Record<string, number>,
      manaCurve: Array(8).fill(0),
      colorDistribution: {
        White: 0,
        Blue: 0,
        Black: 0,
        Red: 0,
        Green: 0,
        Colorless: 0
      },
      rarityDistribution: {
        common: 0,
        uncommon: 0,
        rare: 0,
        mythic: 0
      },
      averageManaValue: 0,
      nonLandCount: 0
    }

    let totalManaValue = 0;

    cards.forEach(card => {
      // Count total cards
      stats.totalCards += card.quantity

      // Type distribution
      const mainType = card.type.split('—')[0].trim().split(' ')[0]
      stats.typeDistribution[mainType] = (stats.typeDistribution[mainType] || 0) + card.quantity

      // Mana curve (excluding lands)
      if (!card.type.toLowerCase().includes('land') && card.manaCost) {
        const cmc = (card.manaCost.match(/{[^}]+}/g) || []).length
        const index = Math.min(cmc, 7)
        stats.manaCurve[index] += card.quantity
        totalManaValue += cmc * card.quantity
        stats.nonLandCount += card.quantity
      }

      // Color distribution
      if (card.colors?.length) {
        card.colors.forEach(color => {
          if (color in stats.colorDistribution) {
            stats.colorDistribution[color as keyof typeof stats.colorDistribution] += card.quantity
          }
        })
      } else {
        stats.colorDistribution.Colorless += card.quantity
      }

      // Rarity distribution
      if (card.rarity) {
        const rarity = card.rarity.toLowerCase() as keyof typeof stats.rarityDistribution
        if (rarity in stats.rarityDistribution) {
          stats.rarityDistribution[rarity] += card.quantity
        }
      }
    })

    stats.averageManaValue = stats.nonLandCount ? totalManaValue / stats.nonLandCount : 0

    return stats
  }, [cards])

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Cards</h3>
          <p className="text-2xl font-bold text-purple-600">{statistics.totalCards}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Mana Value</h3>
          <p className="text-2xl font-bold text-purple-600">
            {statistics.averageManaValue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Spells</h3>
          <p className="text-2xl font-bold text-purple-600">{statistics.nonLandCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Lands</h3>
          <p className="text-2xl font-bold text-purple-600">
            {statistics.typeDistribution['Land'] || 0}
          </p>
        </div>
      </div>

      {/* Mana Curve */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Mana Curve</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics.manaCurve.map((count, cmc) => ({
              cmc: cmc === 7 ? '7+' : cmc.toString(),
              count
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cmc" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Color Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(statistics.colorDistribution)
                  .filter(([_, count]) => count > 0)
                  .map(([color, count]) => ({ color, count }))}
                dataKey="count"
                nameKey="color"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {Object.entries(statistics.colorDistribution)
                  .filter(([_, count]) => count > 0)
                  .map(([color]) => (
                    <Cell 
                      key={`cell-${color}`} 
                      fill={COLOR_MAP[color as keyof typeof COLOR_MAP]} 
                    />
                  ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rarity Distribution */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Rarity Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(statistics.rarityDistribution)
                  .filter(([_, count]) => count > 0)
                  .map(([rarity, count]) => ({ rarity, count }))}
                dataKey="count"
                nameKey="rarity"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {Object.entries(statistics.rarityDistribution)
                  .filter(([_, count]) => count > 0)
                  .map(([rarity]) => (
                    <Cell 
                      key={`cell-${rarity}`} 
                      fill={RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]} 
                    />
                  ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}