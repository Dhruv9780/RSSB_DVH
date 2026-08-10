import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(100),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
