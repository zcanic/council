
import { prisma } from '@/lib/prisma';
import { summarizeCommentsWithAI } from '@/features/summaries/ai.service';
import { ForbiddenError, NotFoundError } from '@/lib/exceptions';
import type { CreateCommentInput } from './comment.validation';

const COMMENTS_PER_LOOP = 10;

/**
 * Creates a comment and, if it's the 10th comment in a loop, triggers the AI summarization process.
 * This entire process is wrapped in a database transaction to ensure data integrity.
 * @param {CreateCommentInput} input - The validated data for creating the comment.
 * @returns {Promise<Comment>} The newly created comment.
 */
export async function createCommentAndProcessLoop(input: CreateCommentInput) {
  const { content, author, parentId, parentType } = input;

  // Use extended timeout for transactions that include AI processing
  const transactionTimeout = parseInt(process.env.DB_TRANSACTION_TIMEOUT || '30000', 10);

  return prisma.$transaction(async (tx) => {
    // 1. Find the parent (Topic or Summary) and check its status
    let parentTopicId: string;
    if (parentType === 'topic') {
      const topic = await tx.topic.findUnique({ where: { id: parentId } });
      if (!topic) throw new NotFoundError('Topic');
      if (topic.status === 'locked') throw new ForbiddenError('This discussion loop is locked.');
      parentTopicId = topic.id;
    } else { // parentType is 'summary'
      const summary = await tx.summary.findUnique({ where: { id: parentId } });
      if (!summary) throw new NotFoundError('Summary');
      // We need to find the root topic ID for the new summary
      if (!summary.topicId) throw new Error('Parent summary is missing its root topicId.');
      parentTopicId = summary.topicId;
    }

    // 2. Create the new comment
    const newComment = await tx.comment.create({
      data: {
        content,
        author,
        topicId: parentType === 'topic' ? parentId : undefined,
        summaryId: parentType === 'summary' ? parentId : undefined,
      },
    });

    // 3. Check if the loop is complete
    const commentCount = await tx.comment.count({ where: { [parentType === 'topic' ? 'topicId' : 'summaryId']: parentId } });

    if (commentCount >= COMMENTS_PER_LOOP) {
      // 3.1. Lock the parent topic if it's a topic
      if (parentType === 'topic') {
        await tx.topic.update({ where: { id: parentId }, data: { status: 'locked' } });
      }
      // Note: Summaries don't have a status and are implicitly locked once they have comments.

      // 3.2. Fetch the comments for summarization
      const commentsToSummarize = await tx.comment.findMany({
        where: { [parentType === 'topic' ? 'topicId' : 'summaryId']: parentId },
        orderBy: { createdAt: 'asc' },
        take: COMMENTS_PER_LOOP,
      });

      // 3.3. Call the AI service (this happens outside the DB transaction lock but within the logical transaction)
      const summaryResult = await summarizeCommentsWithAI(commentsToSummarize);

      // 3.4. Create the new summary in the database
      await tx.summary.create({
        data: {
          content: summaryResult.consensus, // Main display content
          metadata: summaryResult as any,   // Full AI JSON output
          topicId: parentTopicId,           // Link back to the root topic
          parentId: parentType === 'summary' ? parentId : undefined, // Link to parent summary if applicable
        },
      });
    }

    return newComment;
  }, {
    timeout: transactionTimeout,
  });
}
