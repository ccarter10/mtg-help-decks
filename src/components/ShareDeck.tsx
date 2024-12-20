'use client'
import { useState } from 'react'
import { Share2, Copy, Download, Link, CheckCheck } from 'lucide-react'

interface ShareDeckProps {
  deck: {
    id: string
    name: string
    description: string
    cards: Array<{
      quantity: number
      name: string
    }>
  }
}

export default function ShareDeck({ deck }: ShareDeckProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/decks/${deck.id}/share`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to share deck')
      const data = await response.json()
      setShareUrl(data.shareUrl)
    } catch (error) {
      console.error('Share error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const exportDeck = () => {
    const deckList = [
      `// ${deck.name}`,
      deck.description && `// ${deck.description}`,
      '',
      '// Main Deck',
      ...deck.cards.map(card => `${card.quantity} ${card.name}`),
    ].filter(Boolean).join('\n')

    const blob = new Blob([deckList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.name.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        disabled={loading}
      >
        <Share2 size={20} />
        {loading ? 'Sharing...' : 'Share Deck'}
      </button>

      {shareUrl && (
        <div className="p-4 bg-purple-50 rounded-lg space-y-4">
          <p className="font-medium">Share this deck:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            >
              {copied ? <CheckCheck size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportDeck}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded"
            >
              <Download size={20} />
              Export as Text
            </button>
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded"
            >
              <Link size={20} />
              Open in New Tab
            </button>
          </div>
        </div>
      )}
    </div>
  )
}