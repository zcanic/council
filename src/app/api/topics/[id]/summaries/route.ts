import { NextResponse } from 'next/server';

import { NotFoundError, AppError } from '@/lib/exceptions';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/topics/[id]/summaries
 * Returns all summaries for a specific topic
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id }
    });

    if (!topic) {
      throw new NotFoundError('Topic');
    }

    // Get all summaries for this topic
    const summaries = await prisma.summary.findMany({
      where: { topicId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentId: true,
        metadata: true,
      }
    });

    return NextResponse.json(summaries);

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('GET /api/topics/[id]/summaries error:', error);

    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
