
import { prisma } from '@/lib/prisma';
import { summarizeCommentsWithAI } from '@/features/summaries/ai.service';
import { ForbiddenError, NotFoundError } from '@/lib/exceptions';
import type { CreateCommentInput } from './comment.validation';

const COMMENTS_PER_LOOP = 10;

/**
 * Creates a comment and, if it's the 10th comment in a loop, immediately locks the topic
 * and triggers background AI summarization. The user gets immediate response.
 * @param {CreateCommentInput} input - The validated data for creating the comment.
 * @returns {Promise<Comment>} The newly created comment.
 */
export async function createCommentAndProcessLoop(input: CreateCommentInput) {
  const { content, author, parentId, parentType } = input;

  // Step 1: Quick transaction to create comment and check count
  const result = await prisma.$transaction(async (tx) => {
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

    return { newComment, commentCount, parentTopicId };
  });

  // Step 2: If we have 10 comments, handle outside transaction
  if (result.commentCount >= COMMENTS_PER_LOOP) {
    console.log(`🔒 Locking topic and starting background AI processing for ${parentType} ${parentId}`);
    
    // Lock the topic immediately in a separate transaction
    if (parentType === 'topic') {
      await prisma.topic.update({ 
        where: { id: parentId }, 
        data: { status: 'locked' } 
      });
    }

    // Trigger background AI processing (non-blocking)
    processAISummarizationInBackground(parentId, parentType, result.parentTopicId)
      .catch(error => {
        console.error('❌ Background AI summarization failed:', error);
      });
  }

  return result.newComment;
}

/**
 * Background AI processing function that handles summarization without blocking user requests.
 * This function runs asynchronously and can take as long as needed.
 * @param {string} parentId - The ID of the parent (topic or summary)
 * @param {'topic' | 'summary'} parentType - The type of the parent
 * @param {string} parentTopicId - The root topic ID for linking the summary
 */
async function processAISummarizationInBackground(
  parentId: string, 
  parentType: 'topic' | 'summary', 
  parentTopicId: string
) {
  console.log(`🤖 Starting background AI summarization for ${parentType} ${parentId}`);
  
  try {
    // 1. Fetch the comments for summarization in a separate transaction
    const commentsToSummarize = await prisma.comment.findMany({
      where: { [parentType === 'topic' ? 'topicId' : 'summaryId']: parentId },
      orderBy: { createdAt: 'asc' },
      take: COMMENTS_PER_LOOP,
    });

    console.log(`📄 Found ${commentsToSummarize.length} comments to summarize`);

    // 2. Call the AI service (this can take 1+ minutes)
    console.log('🔄 Calling Moonshot AI for summarization...');
    const startTime = Date.now();
    
    const summaryResult = await summarizeCommentsWithAI(commentsToSummarize);
    
    const duration = Date.now() - startTime;
    console.log(`✅ AI summarization completed in ${duration}ms`);

    // 3. Save the summary in a separate transaction
    await prisma.summary.create({
      data: {
        content: summaryResult.consensus, // Main display content
        metadata: summaryResult as any,   // Full AI JSON output
        topicId: parentTopicId,           // Link back to the root topic
        parentId: parentType === 'summary' ? parentId : undefined, // Link to parent summary if applicable
      },
    });

    console.log(`🎉 Summary successfully saved for ${parentType} ${parentId}`);

  } catch (error) {
    console.error(`❌ Background AI summarization failed for ${parentType} ${parentId}:`, error);
    
    // In production, you might want to:
    // 1. Retry the operation
    // 2. Send alert to monitoring service
    // 3. Create a fallback summary
    // 4. Unlock the topic if needed for manual intervention
  }
}
