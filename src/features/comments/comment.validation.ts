
import { z } from 'zod';

/**
 * Schema for validating the creation of a new comment.
 * Ensures all required fields are present and correctly typed.
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Comment content cannot be empty.' })
    .max(10000, { message: 'Comment is too long.' }), // Set a reasonable max length
  author: z.string().max(100).optional(),
  parentId: z.string().cuid({ message: 'Invalid parent ID format.' }),
  parentType: z.enum(['topic', 'summary'], {
    errorMap: () => ({ message: "Parent type must be either 'topic' or 'summary'." }),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
