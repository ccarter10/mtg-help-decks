import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            MTG Deck Builder
          </Link>
          <div className="flex space-x-4">
            <Link href="/decks" className="hover:text-purple-200">
              Decks
            </Link>
            <Link href="/decks/new" className="hover:text-purple-200">
              New Deck
            </Link>
            <Link href="/login" className="hover:text-purple-200">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}