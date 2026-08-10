import { z } from 'zod';

export const globalSearchSchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    color: z.string().trim().optional(),
    itemName: z.string().trim().optional(),
    reportId: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type GlobalSearchQuery = z.infer<typeof globalSearchSchema>['query'];
