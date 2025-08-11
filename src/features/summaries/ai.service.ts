
import OpenAI from 'openai';
import type { Comment } from '@prisma/client';
import { getConfig } from '@/lib/config';
import { ServiceUnavailableError } from '@/lib/exceptions';
import { buildSummarizationPrompt } from './ai.prompts';
import { aiSummarySchema, AISummary } from './ai.validation';

// Initialize the OpenAI client lazily to avoid build-time issues
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const config = getConfig();
    openaiClient = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
      baseURL: config.OPENAI_BASE_URL, // Optional, for compatible APIs
    });
  }
  return openaiClient;
}

/**
 * Summarizes a list of comments using the configured AI model.
 * This function orchestrates prompt building, API call, and response validation.
 * @param {Pick<Comment, 'content'>[]} comments - The list of comments to summarize.
 * @returns {Promise<AISummary>} A promise that resolves to the validated summary object.
 * @throws {ServiceUnavailableError} If the AI API call fails or returns an invalid response.
 */
export async function summarizeCommentsWithAI(comments: Pick<Comment, 'content'>[]): Promise<AISummary> {
  if (comments.length === 0) {
    throw new Error('Cannot summarize an empty list of comments.');
  }

  const prompt = buildSummarizationPrompt(comments);

  try {
    const openai = getOpenAIClient();
    const config = getConfig();
    const response = await openai.chat.completions.create({
      model: config.AI_MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5, // Lower temperature for more deterministic and objective summaries
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new ServiceUnavailableError('AI service returned no content');
    }

    // Parse the JSON content and validate it against our schema
    const parsedJson = JSON.parse(content);
    const validation = aiSummarySchema.safeParse(parsedJson);

    if (!validation.success) {
      console.error('AI output validation failed:', validation.error);
      throw new ServiceUnavailableError('AI service returned malformed data');
    }

    return validation.data;

  } catch (error) {
    console.error('Error calling AI service:', error);
    // Wrap the original error to provide a consistent error type to the caller
    throw new ServiceUnavailableError('AI service');
  }
}
