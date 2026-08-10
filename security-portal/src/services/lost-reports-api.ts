import type { LostReport, MatchingSuggestion } from '../types/api';

import { httpClient } from './http-client';

export type CreateLostReportInput = {
  personName: string;
  phoneNumber: string;
  itemName: string;
  categoryId?: number;
  brand?: string;
  color?: string;
  description?: string;
  specialIdentification?: string;
  approximateValue?: number;
  locationLostId?: number;
  lostDate: string;
  lostTime: string;
  status: 'OPEN' | 'MATCHED' | 'RETURNED' | 'CLOSED';
};

export const lostReportsApi = {
  async list(search?: string) {
    const { data } = await httpClient.get<{
      reports: LostReport[];
      pagination: { page: number; pageSize: number; total: number; totalPages: number };
    }>('/lost-reports', {
      params: {
        page: 1,
        pageSize: 20,
        search,
      },
    });
    return data;
  },

  async create(payload: CreateLostReportInput) {
    const { data } = await httpClient.post<{ report: LostReport; suggestions: MatchingSuggestion[] }>(
      '/lost-reports',
      payload,
    );
    return data;
  },

  async uploadPhoto(lostReportId: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file);

    const { data } = await httpClient.post<{ report: LostReport }>(`/lost-reports/${lostReportId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.report;
  },
};
