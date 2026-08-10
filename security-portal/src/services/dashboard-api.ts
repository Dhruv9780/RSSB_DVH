import { httpClient } from './http-client';

export type DashboardSummary = {
  counters: {
    foundItemTotal: number;
    lostReportTotal: number;
  };
  foundByStatus: Array<{ status: string; _count: { _all: number } }>;
  lostByStatus: Array<{ status: string; _count: { _all: number } }>;
  recentFound: Array<{ id: number; itemCode: string; itemName: string; status: string; createdAt: string }>;
  recentLost: Array<{ id: number; reportCode: string; itemName: string; status: string; createdAt: string }>;
};

export const dashboardApi = {
  async getSummary() {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
