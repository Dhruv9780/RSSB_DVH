import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { generateCode } from '../../utils/code-generator.js';

import type { CreateLostReportInput, ListLostReportsQuery } from './lost-reports.dto.js';
import type { ExportLostReportsQuery } from './lost-reports.dto.js';

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}:00`);
};

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
};

const toLostReportsCsv = (
  rows: Array<{
    id: number;
    reportCode: string;
    personName: string;
    phoneNumber: string;
    itemName: string;
    categoryId: number | null;
    brand: string | null;
    color: string | null;
    description: string | null;
    specialIdentification: string | null;
    approximateValue: Prisma.Decimal | null;
    locationLostId: number | null;
    lostAt: Date;
    status: string;
    photoPath: string | null;
    createdAt: Date;
    category: { name: string } | null;
    locationLost: { name: string } | null;
    createdBy: { username: string; fullName: string };
  }>,
): string => {
  const header = [
    'id',
    'reportCode',
    'personName',
    'phoneNumber',
    'itemName',
    'category',
    'brand',
    'color',
    'description',
    'specialIdentification',
    'approximateValue',
    'locationLost',
    'lostAt',
    'status',
    'photoPath',
    'createdByUsername',
    'createdByFullName',
    'createdAt',
  ].join(',');

  const lines = rows.map((row) =>
    [
      escapeCsv(row.id),
      escapeCsv(row.reportCode),
      escapeCsv(row.personName),
      escapeCsv(row.phoneNumber),
      escapeCsv(row.itemName),
      escapeCsv(row.category?.name ?? ''),
      escapeCsv(row.brand),
      escapeCsv(row.color),
      escapeCsv(row.description),
      escapeCsv(row.specialIdentification),
      escapeCsv(row.approximateValue?.toString() ?? ''),
      escapeCsv(row.locationLost?.name ?? ''),
      escapeCsv(row.lostAt.toISOString()),
      escapeCsv(row.status),
      escapeCsv(row.photoPath),
      escapeCsv(row.createdBy.username),
      escapeCsv(row.createdBy.fullName),
      escapeCsv(row.createdAt.toISOString()),
    ].join(','),
  );

  return [header, ...lines].join('\n');
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

  async exportLostReportsCsv(query: ExportLostReportsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LostReportWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.phoneNumber ? { phoneNumber: { contains: query.phoneNumber } } : {}),
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

    const reports = await prisma.lostReport.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        locationLost: {
          select: {
            name: true,
          },
        },
        createdBy: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });

    return toLostReportsCsv(reports);
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
