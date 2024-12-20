import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, format, cards } = req.body;

    const deck = await prisma.deck.create({
      data: {
        name,
        description,
        format,
        cards,
        user: { connect: { id: req.body.userId } },
      },
    });

    res.status(201).json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ error: 'An error occurred while creating the deck' });
  }
}