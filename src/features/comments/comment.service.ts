
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

  // Step 2: If we have 10 comments, handle locking more efficiently
  if (result.commentCount >= COMMENTS_PER_LOOP) {
    console.log(`🔒 Starting optimized processing for ${parentType} ${parentId}`);
    
    // 立即启动后台处理，不等待锁定操作
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
    // 1. 立即锁定主题（移到后台处理第一步）
    if (parentType === 'topic') {
      await prisma.topic.update({ 
        where: { id: parentId }, 
        data: { status: 'locked' } 
      });
      console.log(`🔒 Topic ${parentId} locked successfully`);
    }

    // 2. 获取要摘要的评论
    const commentsToSummarize = await prisma.comment.findMany({
      where: { [parentType === 'topic' ? 'topicId' : 'summaryId']: parentId },
      orderBy: { createdAt: 'asc' },
      take: COMMENTS_PER_LOOP,
    });

    console.log(`📄 Found ${commentsToSummarize.length} comments to summarize`);

    // 3. 调用AI服务（耗时操作）
    console.log('🔄 Calling Moonshot AI for summarization...');
    const startTime = Date.now();
    
    const summaryResult = await summarizeCommentsWithAI(commentsToSummarize);
    
    const duration = Date.now() - startTime;
    console.log(`✅ AI summarization completed in ${duration}ms`);

    // 4. 保存摘要
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
    
    // 失败时解锁主题，允许用户继续评论
    if (parentType === 'topic') {
      try {
        await prisma.topic.update({ 
          where: { id: parentId }, 
          data: { status: 'active' } 
        });
        console.log(`🔓 Topic ${parentId} unlocked due to AI failure`);
      } catch (unlockError) {
        console.error(`Failed to unlock topic ${parentId}:`, unlockError);
      }
    }
    
    // 生产环境可以考虑：
    // 1. 发送告警通知
    // 2. 创建人工摘要占位符
    // 3. 重试机制
  }
}
