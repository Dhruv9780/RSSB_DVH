import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { generateCode } from '../../utils/code-generator.js';

import type { CreateFoundItemInput, ListFoundItemsQuery } from './found-items.dto.js';

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}:00`);
};

export const foundItemsService = {
  async create(input: CreateFoundItemInput, createdById: number) {
    const existingCount = await prisma.foundItem.count();
    const itemCode = generateCode('FND', existingCount + 1);
    const foundAt = combineDateAndTime(input.foundDate, input.foundTime);

    return prisma.foundItem.create({
      data: {
        itemCode,
        categoryId: input.categoryId,
        itemName: input.itemName,
        description: input.description,
        brand: input.brand,
        color: input.color,
        locationFoundId: input.locationFoundId,
        foundAt,
        storageLocation: input.storageLocation,
        status: input.status,
        createdById,
      },
      include: {
        category: true,
        locationFound: true,
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

  async list(query: ListFoundItemsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FoundItemWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.brand ? { brand: { contains: query.brand } } : {}),
      ...(query.color ? { color: { contains: query.color } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            foundAt: {
              ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { itemCode: { contains: query.search } },
              { itemName: { contains: query.search } },
              { description: { contains: query.search } },
              { brand: { contains: query.search } },
              { color: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.foundItem.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          locationFound: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          images: true,
        },
      }),
      prisma.foundItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: number) {
    return prisma.foundItem.findUnique({
      where: { id },
      include: {
        category: true,
        locationFound: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        images: true,
      },
    });
  },

  async addImages(foundItemId: number, files: Express.Multer.File[]) {
    const foundItem = await prisma.foundItem.findUnique({
      where: { id: foundItemId },
      select: { id: true },
    });

    if (!foundItem) {
      return null;
    }

    const existingCount = await prisma.foundItemImage.count({
      where: { foundItemId },
    });

    if (existingCount + files.length > 5) {
      throw new Error('Maximum 5 images are allowed per found item');
    }

    await prisma.foundItemImage.createMany({
      data: files.map((file) => ({
        foundItemId,
        path: `/uploads/found-items/${file.filename}`,
        filename: file.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      })),
    });

    return prisma.foundItem.findUnique({
      where: { id: foundItemId },
      include: {
        category: true,
        locationFound: true,
        images: true,
      },
    });
  },
};
