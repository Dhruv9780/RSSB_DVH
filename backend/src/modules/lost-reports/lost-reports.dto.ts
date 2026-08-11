import { z } from 'zod';

const lostReportStatusSchema = z.enum(['OPEN', 'MATCHED', 'RETURNED', 'CLOSED']);

export const createLostReportSchema = z.object({
  body: z.object({
    personName: z.string().trim().min(2).max(120),
    phoneNumber: z.string().trim().min(7).max(20),
    itemName: z.string().trim().min(2).max(120),
    categoryId: z.coerce.number().int().positive().optional(),
    brand: z.string().trim().max(80).optional(),
    color: z.string().trim().max(80).optional(),
    description: z.string().trim().max(1000).optional(),
    specialIdentification: z.string().trim().max(500).optional(),
    approximateValue: z.coerce.number().nonnegative().optional(),
    locationLostId: z.coerce.number().int().positive().optional(),
    lostDate: z.string().date(),
    lostTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    status: lostReportStatusSchema.default('OPEN'),
  }),
});

export const listLostReportsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: lostReportStatusSchema.optional(),
    phoneNumber: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    color: z.string().trim().optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
  }),
});

export const exportLostReportsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: lostReportStatusSchema.optional(),
    phoneNumber: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    color: z.string().trim().optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
  }),
});

export type CreateLostReportInput = z.infer<typeof createLostReportSchema>['body'];
export type ListLostReportsQuery = z.infer<typeof listLostReportsSchema>['query'];
export type ExportLostReportsQuery = z.infer<typeof exportLostReportsSchema>['query'];
