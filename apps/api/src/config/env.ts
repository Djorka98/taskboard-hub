import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default('nexus_refresh_token'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const invalidKeys = Object.entries(fieldErrors)
    .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
    .map(([key]) => key);

  console.error('Invalid environment variables', fieldErrors);
  throw new Error(
    `Invalid environment variables: ${invalidKeys.length > 0 ? invalidKeys.join(', ') : 'unknown'}`,
  );
}

export const env = parsed.data;
