import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, format } = await req.json();

    // Basic validation
    if (!name || !format) {
      return NextResponse.json(
        { error: 'Name and format are required' },
        { status: 400 }
      );
    }

    // Create deck
    const deck = await prisma.deck.create({
      data: {
        name,
        description: description || '',
        format,
        cards: {
          create: [],
        },
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
      where: {
        OR: [
          { public: true },
          { user: { email: session.user.email } },
        ],
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}