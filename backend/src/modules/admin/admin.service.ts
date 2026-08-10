import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http-error.js';

import type { CreateUserInput, ListActivityQuery, ListUsersQuery, UpdateUserInput } from './admin.dto.js';

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
};

const toUsersCsv = (
  rows: Array<{
    id: number;
    username: string;
    fullName: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>,
): string => {
  const header = [
    'id',
    'username',
    'fullName',
    'phone',
    'role',
    'isActive',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
  ].join(',');

  const lines = rows.map((row) =>
    [
      escapeCsv(row.id),
      escapeCsv(row.username),
      escapeCsv(row.fullName),
      escapeCsv(row.phone),
      escapeCsv(row.role),
      escapeCsv(row.isActive),
      escapeCsv(row.lastLoginAt?.toISOString() ?? ''),
      escapeCsv(row.createdAt.toISOString()),
      escapeCsv(row.updatedAt.toISOString()),
    ].join(','),
  );

  return [header, ...lines].join('\n');
};

const toActivityCsv = (
  rows: Array<{
    id: number;
    action: string;
    entity: string;
    entityId: string | null;
    userId: number | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    user: { username: string; fullName: string; role: string } | null;
  }>,
): string => {
  const header = [
    'id',
    'createdAt',
    'action',
    'entity',
    'entityId',
    'userId',
    'username',
    'fullName',
    'role',
    'ipAddress',
    'userAgent',
  ].join(',');

  const lines = rows.map((row) =>
    [
      escapeCsv(row.id),
      escapeCsv(row.createdAt.toISOString()),
      escapeCsv(row.action),
      escapeCsv(row.entity),
      escapeCsv(row.entityId),
      escapeCsv(row.userId),
      escapeCsv(row.user?.username ?? ''),
      escapeCsv(row.user?.fullName ?? ''),
      escapeCsv(row.user?.role ?? ''),
      escapeCsv(row.ipAddress),
      escapeCsv(row.userAgent),
    ].join(','),
  );

  return [header, ...lines].join('\n');
};

export const adminService = {
  async listUsers(query: ListUsersQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { username: { contains: query.search } },
              { fullName: { contains: query.search } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async setUserActiveStatus(userId: number, isActive: boolean) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new HttpError('User not found', 404);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async createUser(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { username: input.username },
      select: { id: true },
    });

    if (existing) {
      throw new HttpError('Username already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.user.create({
      data: {
        username: input.username,
        fullName: input.fullName,
        phone: input.phone || null,
        role: input.role,
        isActive: input.isActive ?? true,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateUser(userId: number, input: UpdateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new HttpError('User not found', 404);
    }

    const updateData: Prisma.UserUpdateInput = {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };

    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, 12);
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async listActivity(query: ListActivityQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ActivityLogWhereInput = {
      ...(query.action ? { action: { contains: query.action } } : {}),
      ...(query.entity ? { entity: { contains: query.entity } } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async exportUsersCsv(query: ListUsersQuery) {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { username: { contains: query.search } },
              { fullName: { contains: query.search } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return toUsersCsv(users);
  },

  async exportActivityCsv(query: ListActivityQuery) {
    const where: Prisma.ActivityLogWhereInput = {
      ...(query.action ? { action: { contains: query.action } } : {}),
      ...(query.entity ? { entity: { contains: query.entity } } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return toActivityCsv(logs);
  },
};