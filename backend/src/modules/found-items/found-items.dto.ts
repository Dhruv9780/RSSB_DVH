import { z } from 'zod';

const foundItemStatusSchema = z.enum(['STORED', 'CLAIMED', 'RETURNED', 'ARCHIVED']);

export const createFoundItemSchema = z.object({
  body: z.object({
    categoryId: z.coerce.number().int().positive(),
    itemName: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    brand: z.string().trim().max(80).optional(),
    color: z.string().trim().max(80).optional(),
    locationFoundId: z.coerce.number().int().positive(),
    foundDate: z.string().date(),
    foundTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    storageLocation: z.string().trim().min(2).max(120),
    status: foundItemStatusSchema.default('STORED'),
  }),
});

export const listFoundItemsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: foundItemStatusSchema.optional(),
    brand: z.string().trim().optional(),
    color: z.string().trim().optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
  }),
});

export type CreateFoundItemInput = z.infer<typeof createFoundItemSchema>['body'];
export type ListFoundItemsQuery = z.infer<typeof listFoundItemsSchema>['query'];
