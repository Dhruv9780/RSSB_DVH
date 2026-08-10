import type { ActivityLog, AdminUser, PaginatedResponse } from '../types/api';

import { httpClient } from './http-client';

type UsersQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
  isActive?: boolean;
};

type ActivityQuery = {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
};

export const adminApi = {
  async listUsers(query: UsersQuery) {
    const { data } = await httpClient.get<PaginatedResponse<{ users: AdminUser[] }>>('/admin/users', {
      params: query,
    });
    return data;
  },

  async setUserStatus(userId: number, isActive: boolean) {
    const { data } = await httpClient.patch<{ user: AdminUser }>(`/admin/users/${userId}/status`, {
      isActive,
    });
    return data.user;
  },

  async listActivity(query: ActivityQuery) {
    const { data } = await httpClient.get<PaginatedResponse<{ logs: ActivityLog[] }>>('/admin/activity', {
      params: query,
    });
    return data;
  },

  async createUser(payload: {
    username: string;
    fullName: string;
    phone?: string;
    role: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
    password: string;
    isActive?: boolean;
  }) {
    const { data } = await httpClient.post<{ user: AdminUser }>('/admin/users', payload);
    return data.user;
  },

  async updateUser(
    userId: number,
    payload: {
      fullName?: string;
      phone?: string | null;
      role?: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
      password?: string;
      isActive?: boolean;
    },
  ) {
    const { data } = await httpClient.patch<{ user: AdminUser }>(`/admin/users/${userId}`, payload);
    return data.user;
  },

  async exportUsersCsv(query: UsersQuery) {
    const { data } = await httpClient.get<Blob>('/admin/users/export.csv', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },

  async exportActivityCsv(query: ActivityQuery) {
    const { data } = await httpClient.get<Blob>('/admin/activity/export.csv', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },
};