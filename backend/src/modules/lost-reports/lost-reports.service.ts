import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { generateCode } from '../../utils/code-generator.js';

import type { CreateLostReportInput, ListLostReportsQuery } from './lost-reports.dto.js';

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}:00`);
};

export const lostReportsService = {
  async create(input: CreateLostReportInput, createdById: number) {
    const existingCount = await prisma.lostReport.count();
    const reportCode = generateCode('LST', existingCount + 1);
    const lostAt = combineDateAndTime(input.lostDate, input.lostTime);

    return prisma.lostReport.create({
      data: {
        reportCode,
        personName: input.personName,
        phoneNumber: input.phoneNumber,
        itemName: input.itemName,
        categoryId: input.categoryId,
        brand: input.brand,
        color: input.color,
        description: input.description,
        specialIdentification: input.specialIdentification,
        approximateValue:
          input.approximateValue !== undefined ? new Prisma.Decimal(input.approximateValue) : undefined,
        locationLostId: input.locationLostId,
        lostAt,
        status: input.status,
        createdById,
      },
      include: {
        category: true,
        locationLost: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  async list(query: ListLostReportsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LostReportWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.phoneNumber
        ? { phoneNumber: { contains: query.phoneNumber } }
        : {}),
      ...(query.brand ? { brand: { contains: query.brand } } : {}),
      ...(query.color ? { color: { contains: query.color } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            lostAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { reportCode: { contains: query.search } },
              { itemName: { contains: query.search } },
              { description: { contains: query.search } },
              { personName: { contains: query.search } },
              { phoneNumber: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [reports, total] = await Promise.all([
      prisma.lostReport.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          locationLost: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.lostReport.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: number) {
    return prisma.lostReport.findUnique({
      where: { id },
      include: {
        category: true,
        locationLost: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  async attachPhoto(lostReportId: number, file: Express.Multer.File) {
    const report = await prisma.lostReport.findUnique({
      where: { id: lostReportId },
      select: { id: true },
    });

    if (!report) {
      return null;
    }

    return prisma.lostReport.update({
      where: { id: lostReportId },
      data: {
        photoPath: `/uploads/lost-reports/${file.filename}`,
      },
      include: {
        category: true,
        locationLost: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },
};
