import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../[...nextauth]/route'

// Get individual deck
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Check if user has access to this deck
    if (!deck.public && deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    )
  }
}

// Update deck
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.id }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    if (deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, format, cards } = await req.json()

    const updatedDeck = await prisma.deck.update({
      where: { id: params.id },
      data: {
        name,
        description,
        format,
        cards
      }
    })

    return NextResponse.json(updatedDeck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    )
  }
}

// Delete deck
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.id }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    if (deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.deck.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Deck deleted successfully' })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    )
  }
}