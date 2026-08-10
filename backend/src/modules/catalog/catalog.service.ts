import { prisma } from '../../lib/prisma.js';

export const catalogService = {
  async getCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async getLocations() {
    return prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async upsertCategory(input: { name: string; description?: string; isActive?: boolean }) {
    return prisma.category.upsert({
      where: { name: input.name },
      create: {
        name: input.name,
        description: input.description,
        isActive: input.isActive ?? true,
      },
      update: {
        description: input.description,
        isActive: input.isActive ?? true,
      },
    });
  },

  async upsertLocation(input: { name: string; description?: string; isActive?: boolean }) {
    return prisma.location.upsert({
      where: { name: input.name },
      create: {
        name: input.name,
        description: input.description,
        isActive: input.isActive ?? true,
      },
      update: {
        description: input.description,
        isActive: input.isActive ?? true,
      },
    });
  },
};
