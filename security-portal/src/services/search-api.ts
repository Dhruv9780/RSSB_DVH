import type { GlobalSearchResult } from '../types/api';

import { httpClient } from './http-client';

export type GlobalSearchInput = {
  q?: string;
  categoryId?: number;
  status?: string;
  brand?: string;
  color?: string;
  itemName?: string;
  reportId?: string;
  phoneNumber?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const searchApi = {
  async global(input: GlobalSearchInput) {
    const { data } = await httpClient.get<GlobalSearchResult>('/search/global', {
      params: {
        page: 1,
        pageSize: 20,
        ...input,
      },
    });
    return data;
  },
};
