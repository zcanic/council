
import { NextResponse } from 'next/server';
import { createCommentSchema } from '@/features/comments/comment.validation';
import { createCommentAndProcessLoop } from '@/features/comments/comment.service';
import { BadRequestError, AppError } from '@/lib/exceptions';

/**
 * Handles POST requests to create a new comment and potentially trigger a summary.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      throw new BadRequestError('Invalid input', validation.error.errors);
    }

    const newComment = await createCommentAndProcessLoop(validation.data);

    return NextResponse.json(newComment, { status: 201 });

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message, errors: (error as BadRequestError).errors },
        { status: error.statusCode }
      );
    }

    console.error('POST /api/comments error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
