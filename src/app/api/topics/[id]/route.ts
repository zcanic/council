
import { NextResponse } from 'next/server';
import { getTopicTree } from '@/features/topics/topic.service';
import { NotFoundError } from '@/lib/exceptions';

interface Params {
  id: string;
}

/**
 * Handles GET requests to fetch a single topic tree by its ID.
 */
export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const topicTree = await getTopicTree(params.id);
    return NextResponse.json(topicTree);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error(`GET /api/topics/${params.id} error:`, error);
    return NextResponse.json({ message: 'Failed to fetch topic' }, { status: 500 });
  }
}
