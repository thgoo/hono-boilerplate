import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters long'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error('Invalid environment variables: ' + JSON.stringify(result.error.flatten().fieldErrors));
}

export const config = result.data;
