import { z } from 'zod';

export const upsertCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(300).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const upsertLocationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(300).optional(),
    isActive: z.boolean().optional(),
  }),
});
