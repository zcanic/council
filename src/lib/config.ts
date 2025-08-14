
import { z } from 'zod';

/**
 * Defines the schema for environment variables using Zod.
 * This ensures that all required environment variables are present and correctly formatted
 * when the application starts, preventing runtime errors due to missing configuration.
 */
const envSchema = z.object({
  // Database URL from .env file
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // AI Service Configuration
  OPENAI_API_KEY: z.string().min(1, { message: 'OPENAI_API_KEY is required' }),
  // Optional: If using a different base URL for OpenAI compatible APIs
  OPENAI_BASE_URL: z.string().url().optional(),

  // The specific model name to be used for AI operations
  AI_MODEL_NAME: z.string().min(1).default('gpt-4-turbo'),
});

/**
 * Validates the current environment variables against the defined schema.
 * If validation fails, it will throw a descriptive error, halting the application startup.
 * This early failure prevents the application from running with an invalid configuration.
 */
function parseConfig() {
  return envSchema.parse(process.env);
}

// Export a getter function instead of parsing immediately
export function getConfig() {
  return parseConfig();
}

// For backward compatibility, export parsed config for non-build contexts
let config: z.infer<typeof envSchema> | null = null;

try {
  // Only parse config if not in build mode
  if (process.env.NODE_ENV !== undefined) {
    config = parseConfig();
  }
} catch (error) {
  // Ignore config errors during build
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

export { config };
