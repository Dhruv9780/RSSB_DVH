import type { DashboardSummary } from '../types/api';

import { httpClient } from './http-client';

export const dashboardApi = {
  async getSummary() {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};