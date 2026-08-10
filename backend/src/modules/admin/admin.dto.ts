import { z } from 'zod';

const positiveIntFromString = z.coerce.number().int().positive();

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().trim().min(1).max(80).optional(),
    role: z.enum(['SECURITY_SEWADAR', 'SUPER_ADMIN']).optional(),
    isActive: z
      .string()
      .transform((value) => value === 'true')
      .optional(),
  }),
});

export const listActivitySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    action: z.string().trim().min(1).max(100).optional(),
    entity: z.string().trim().min(1).max(100).optional(),
    userId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

export const exportUsersSchema = z.object({
  query: z.object({
    search: z.string().trim().min(1).max(80).optional(),
    role: z.enum(['SECURITY_SEWADAR', 'SUPER_ADMIN']).optional(),
    isActive: z
      .string()
      .transform((value) => value === 'true')
      .optional(),
  }),
});

export const exportActivitySchema = z.object({
  query: z.object({
    action: z.string().trim().min(1).max(100).optional(),
    entity: z.string().trim().min(1).max(100).optional(),
    userId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(50),
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().max(20).optional(),
    role: z.enum(['SECURITY_SEWADAR', 'SUPER_ADMIN']),
    password: z.string().min(8).max(100),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: positiveIntFromString,
  }),
  body: z.object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(20).nullable().optional(),
    role: z.enum(['SECURITY_SEWADAR', 'SUPER_ADMIN']).optional(),
    password: z.string().min(8).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: positiveIntFromString,
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type ListActivityQuery = z.infer<typeof listActivitySchema>['query'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];