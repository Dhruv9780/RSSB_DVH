import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http-error.js';

import type { CreateReturnInput } from './returns.dto.js';

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}:00`);
};

export const returnsService = {
  async create(input: CreateReturnInput, returnedById: number, receiverPhoto?: Express.Multer.File) {
    const foundItem = await prisma.foundItem.findUnique({
      where: { id: input.foundItemId },
      select: { id: true, status: true },
    });

    if (!foundItem) {
      throw new HttpError('Found item not found', 404);
    }

    if (foundItem.status === 'RETURNED') {
      throw new HttpError('Found item is already returned', 409);
    }

    if (input.lostReportId) {
      const report = await prisma.lostReport.findUnique({
        where: { id: input.lostReportId },
        select: { id: true },
      });

      if (!report) {
        throw new HttpError('Lost report not found', 404);
      }
    }

    const returnedAt = combineDateAndTime(input.returnDate, input.returnTime);

    return prisma.$transaction(async (tx) => {
      const returnEntry = await tx.returnHistory.create({
        data: {
          foundItemId: input.foundItemId,
          lostReportId: input.lostReportId,
          returnedTo: input.returnedTo,
          receiverPhotoPath: receiverPhoto ? `/uploads/returns/${receiverPhoto.filename}` : undefined,
          phoneNumber: input.phoneNumber,
          identityVerified: input.identityVerified,
          returnedById,
          returnedAt,
          remarks: input.remarks,
        },
        include: {
          foundItem: true,
          lostReport: true,
          returnedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      });

      await tx.foundItem.update({
        where: { id: input.foundItemId },
        data: { status: 'RETURNED' },
      });

      if (input.lostReportId) {
        await tx.lostReport.update({
          where: { id: input.lostReportId },
          data: { status: 'RETURNED' },
        });
      }

      return returnEntry;
    });
  },
};
