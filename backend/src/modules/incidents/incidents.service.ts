import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { generateCode } from '../../utils/code-generator.js';

import type {
  CreateIncidentInput,
  ListIncidentsQuery,
  UpdateIncidentStatusInput,
} from './incidents.dto.js';

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}:00`);
};

export const incidentsService = {
  async create(input: CreateIncidentInput, createdById: number) {
    const existingCount = await prisma.incident.count();
    const incidentCode = generateCode('INC', existingCount + 1);
    const incidentAt = combineDateAndTime(input.incidentDate, input.incidentTime);

    return prisma.incident.create({
      data: {
        incidentCode,
        title: input.title,
        description: input.description,
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
