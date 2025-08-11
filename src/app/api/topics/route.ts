
import { NextResponse } from 'next/server';
import { createTopic, getAllTopics } from '@/features/topics/topic.service';
import { createTopicSchema } from '@/features/topics/topic.validation';
import { ZodError } from 'zod';
import { BadRequestError } from '@/lib/exceptions';

/**
 * Handles GET requests to fetch all topics.
 */
export async function GET() {
  try {
    const topics = await getAllTopics();
    return NextResponse.json(topics);
  } catch (error) {
    console.error('GET /api/topics error:', error);
    return NextResponse.json({ message: 'Failed to fetch topics' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new topic.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createTopicSchema.safeParse(body);

    if (!validation.success) {
      throw new BadRequestError('Invalid input', validation.error.errors);
    }

    const newTopic = await createTopic(validation.data.title);
    return NextResponse.json(newTopic, { status: 201 });

  } catch (error) {
    if (error instanceof BadRequestError) {
      return NextResponse.json({ message: error.message, errors: error.errors }, { status: error.statusCode });
    }
    if (error instanceof ZodError) { // Redundant but safe
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('POST /api/topics error:', error);
    return NextResponse.json({ message: 'Failed to create topic' }, { status: 500 });
  }
}
