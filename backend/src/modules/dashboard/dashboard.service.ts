import { prisma } from '../../lib/prisma.js';

export const dashboardService = {
  async getSummary() {
    const [foundItemTotal, lostReportTotal, foundByStatus, lostByStatus, recentFound, recentLost] =
      await Promise.all([
        prisma.foundItem.count(),
        prisma.lostReport.count(),
        prisma.foundItem.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.lostReport.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.foundItem.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            itemCode: true,
            itemName: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.lostReport.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            reportCode: true,
            itemName: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      counters: {
        foundItemTotal,
        lostReportTotal,
      },
      foundByStatus,
      lostByStatus,
      recentFound,
      recentLost,
    };
  },
};
