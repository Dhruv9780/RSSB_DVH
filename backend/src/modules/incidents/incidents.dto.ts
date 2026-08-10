import { z } from 'zod';

const incidentPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const incidentStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const createIncidentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(140),
    description: z.string().trim().max(2000).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    priority: incidentPrioritySchema,
    location: z.string().trim().min(2).max(200),
    incidentDate: z.string().date(),
    incidentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    reporterName: z.string().trim().min(2).max(120),
    reporterContact: z.string().trim().min(7).max(40),
    status: z.literal('OPEN').default('OPEN'),
  }),
});

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    priority: incidentPrioritySchema.optional(),
    status: incidentStatusSchema.optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
  }),
});

export const updateIncidentStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: incidentStatusSchema,
  }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>['body'];
export type ListIncidentsQuery = z.infer<typeof listIncidentsSchema>['query'];
export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>['body'];
