import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../[...nextauth]/route'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deck = await prisma.deck.update({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user owns the deck
      },
      data: {
        public: true
      }
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/decks/${deck.id}`
    return NextResponse.json({ shareUrl })
  } catch (error) {
    console.error('Share deck error:', error)
    return NextResponse.json(
      { error: 'Failed to share deck' },
      { status: 500 }
    )
  }
}