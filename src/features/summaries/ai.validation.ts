
import { z } from 'zod';

/**
 * Defines the strict schema for the JSON object expected from the AI service.
 * This validation ensures that the AI's output conforms to the structure required by the application,
 * preventing malformed data from being processed and stored.
 */
export const aiSummarySchema = z.object({
  consensus: z
    .string()
    .describe('The core consensus or main theme derived from the comments.'),
  disagreements: z
    .array(
      z.object({
        point: z.string().describe('A specific point of disagreement.'),
        views: z.array(z.string()).describe('A list of different views on this point.'),
      })
    )
    .describe('A list of key disagreements, ideally 1-3.'),
  new_questions: z
    .array(z.string())
    .describe('A list of valuable new questions raised in the discussion.'),
});

// Export the inferred TypeScript type for use in other parts of the application.
export type AISummary = z.infer<typeof aiSummarySchema>;
