import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { generateCode } from '../../utils/code-generator.js';

import type {
  CreateIncidentInput,
  ExportIncidentsQuery,
  ListIncidentsQuery,
  UpdateIncidentStatusInput,
} from './incidents.dto.js';

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

const toIncidentsCsv = (
  rows: Array<{
    id: number;
    incidentCode: string;
    title: string;
    description: string | null;
    imagePath: string | null;
    priority: string;
    location: string;
    incidentAt: Date;
    reporterName: string;
    reporterContact: string;
    status: string;
    createdAt: Date;
    category: { name: string } | null;
    createdBy: { username: string; fullName: string };
  }>,
): string => {
  const header = [
    'id',
    'incidentCode',
    'title',
    'description',
    'imagePath',
    'priority',
    'location',
    'incidentAt',
    'reporterName',
    'reporterContact',
    'status',
    'category',
    'createdByUsername',
    'createdByFullName',
    'createdAt',
  ].join(',');

  const lines = rows.map((row) =>
    [
      escapeCsv(row.id),
      escapeCsv(row.incidentCode),
      escapeCsv(row.title),
      escapeCsv(row.description),
      escapeCsv(row.imagePath),
      escapeCsv(row.priority),
      escapeCsv(row.location),
      escapeCsv(row.incidentAt.toISOString()),
      escapeCsv(row.reporterName),
      escapeCsv(row.reporterContact),
      escapeCsv(row.status),
      escapeCsv(row.category?.name ?? ''),
      escapeCsv(row.createdBy.username),
      escapeCsv(row.createdBy.fullName),
      escapeCsv(row.createdAt.toISOString()),
    ].join(','),
  );

  return [header, ...lines].join('\n');
};

export const incidentsService = {
  async create(input: CreateIncidentInput, createdById: number, imageFile?: Express.Multer.File) {
    const existingCount = await prisma.incident.count();
    const incidentCode = generateCode('INC', existingCount + 1);
    const incidentAt = combineDateAndTime(input.incidentDate, input.incidentTime);

    return prisma.incident.create({
      data: {
        incidentCode,
        title: input.title,
        description: input.description,
        imagePath: imageFile ? `/uploads/incidents/${imageFile.filename}` : undefined,
        categoryId: input.categoryId,
        priority: input.priority,
        location: input.location,
        incidentAt,
        reporterName: input.reporterName,
        reporterContact: input.reporterContact,
        status: 'OPEN',
        createdById,
      },
      include: {
        category: true,
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

  async list(query: ListIncidentsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.IncidentWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            incidentAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { incidentCode: { contains: query.search } },
              { title: { contains: query.search } },
              { description: { contains: query.search } },
              { location: { contains: query.search } },
              { reporterName: { contains: query.search } },
              { reporterContact: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async exportIncidentsCsv(query: ExportIncidentsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.IncidentWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            incidentAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { incidentCode: { contains: query.search } },
              { title: { contains: query.search } },
              { description: { contains: query.search } },
              { location: { contains: query.search } },
              { reporterName: { contains: query.search } },
              { reporterContact: { contains: query.search } },
            ],
          }
        : {}),
    };

    const incidents = await prisma.incident.findMany({
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
        createdBy: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });

    return toIncidentsCsv(incidents);
  },

  async updateStatus(incidentId: number, payload: UpdateIncidentStatusInput) {
    const existing = await prisma.incident.findUnique({
      where: { id: incidentId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: payload.status,
      },
      include: {
        category: true,
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
