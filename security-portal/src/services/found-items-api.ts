import type { FoundItem } from '../types/api';

import { httpClient } from './http-client';

export type CreateFoundItemInput = {
  categoryId: number;
  itemName: string;
  description?: string;
  brand?: string;
  color?: string;
  locationFoundId: number;
  foundDate: string;
  foundTime: string;
  storageLocation: string;
  status: 'STORED' | 'CLAIMED' | 'RETURNED' | 'ARCHIVED';
};

export const foundItemsApi = {
  async list(search?: string) {
    const { data } = await httpClient.get<{
      items: FoundItem[];
      pagination: { page: number; pageSize: number; total: number; totalPages: number };
    }>('/found-items', {
      params: {
        page: 1,
        pageSize: 20,
        search,
      },
    });
    return data;
  },

  async create(payload: CreateFoundItemInput) {
    const { data } = await httpClient.post<{ item: FoundItem }>('/found-items', payload);
    return data.item;
  },

  async uploadImages(foundItemId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const { data } = await httpClient.post<{ item: FoundItem }>(`/found-items/${foundItemId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.item;
  },
};
