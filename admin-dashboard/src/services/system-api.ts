import type { HealthResponse } from '../types/api';

import { httpClient } from './http-client';

export const systemApi = {
  async health() {
    const { data } = await httpClient.get<HealthResponse>('/health');
    return data;
  },
};