import { httpClient } from './http-client';

export type ExportLostReportsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  status?: 'OPEN' | 'MATCHED' | 'RETURNED' | 'CLOSED';
  phoneNumber?: string;
  brand?: string;
  color?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const lostReportsApi = {
  async exportCsv(query: ExportLostReportsQuery) {
    const { data } = await httpClient.get<Blob>('/lost-reports/export.csv', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },
};
