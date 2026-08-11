import { httpClient } from './http-client';

export type ExportFoundItemsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  status?: 'STORED' | 'CLAIMED' | 'RETURNED' | 'ARCHIVED';
  brand?: string;
  color?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const foundItemsApi = {
  async exportCsv(query: ExportFoundItemsQuery) {
    const { data } = await httpClient.get<Blob>('/found-items/export.csv', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },
};
