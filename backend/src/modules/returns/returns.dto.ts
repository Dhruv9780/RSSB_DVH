import { z } from 'zod';

export const createReturnSchema = z.object({
  body: z.object({
    foundItemId: z.coerce.number().int().positive(),
    lostReportId: z.coerce.number().int().positive().optional(),
    returnedTo: z.string().trim().min(2).max(120),
    phoneNumber: z.string().trim().min(7).max(20),
    identityVerified: z.coerce.boolean(),
    returnDate: z.string().date(),
    returnTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    remarks: z.string().trim().max(500).optional(),
  }),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>['body'];
