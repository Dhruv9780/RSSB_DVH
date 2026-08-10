import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES_IN: z.string().default('8h'),
  BOOTSTRAP_ADMIN_USERNAME: z.string().default('superadmin'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().default('ChangeMe123!'),
  BOOTSTRAP_ADMIN_FULL_NAME: z.string().default('Super Admin'),
  BOOTSTRAP_ADMIN_PHONE: z.string().optional(),
});

export const env = envSchema.parse(process.env);
