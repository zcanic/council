
import { z } from 'zod';

/**
 * Schema for validating the creation of a new topic.
 * Ensures the title is a non-empty string with a reasonable length.
 */
export const createTopicSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required.',
    })
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(255, { message: 'Title must be no more than 255 characters long.' }),
});

/**
 * Schema for validating the topic ID from a URL parameter.
 * Ensures the ID is a non-empty string (Prisma uses CUIDs).
 */
export const topicIdSchema = z.object({
  id: z.string().cuid({ message: 'Invalid topic ID format.' }),
});
