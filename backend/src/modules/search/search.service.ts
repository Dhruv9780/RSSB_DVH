import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

import type { GlobalSearchQuery } from './search.dto.js';

export const searchService = {
  async globalSearch(query: GlobalSearchQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const foundWhere: Prisma.FoundItemWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status as Prisma.EnumFoundItemStatusFilter['equals'] } : {}),
      ...(query.brand ? { brand: { contains: query.brand } } : {}),
      ...(query.color ? { color: { contains: query.color } } : {}),
      ...(query.itemName ? { itemName: { contains: query.itemName } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            foundAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { itemCode: { contains: query.q } },
              { itemName: { contains: query.q } },
              { description: { contains: query.q } },
              { brand: { contains: query.q } },
              { color: { contains: query.q } },
            ],
          }
        : {}),
    };

    const lostWhere: Prisma.LostReportWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status as Prisma.EnumLostReportStatusFilter['equals'] } : {}),
      ...(query.brand ? { brand: { contains: query.brand } } : {}),
      ...(query.color ? { color: { contains: query.color } } : {}),
      ...(query.itemName ? { itemName: { contains: query.itemName } } : {}),
      ...(query.reportId ? { reportCode: { contains: query.reportId } } : {}),
      ...(query.phoneNumber ? { phoneNumber: { contains: query.phoneNumber } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            lostAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { reportCode: { contains: query.q } },
              { itemName: { contains: query.q } },
              { description: { contains: query.q } },
              { personName: { contains: query.q } },
              { phoneNumber: { contains: query.q } },
            ],
          }
        : {}),
    };

    const [foundItems, lostReports, foundTotal, lostTotal] = await Promise.all([
      prisma.foundItem.findMany({
        where: foundWhere,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          locationFound: true,
          images: true,
        },
      }),
      prisma.lostReport.findMany({
        where: lostWhere,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          locationLost: true,
        },
      }),
      prisma.foundItem.count({ where: foundWhere }),
      prisma.lostReport.count({ where: lostWhere }),
    ]);

    return {
      foundItems,
      lostReports,
      pagination: {
        page,
        pageSize,
        foundTotal,
        foundTotalPages: Math.ceil(foundTotal / pageSize),
        lostTotal,
        lostTotalPages: Math.ceil(lostTotal / pageSize),
      },
    };
  },
};
