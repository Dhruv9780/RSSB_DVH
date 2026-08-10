import type { AppUser, LoginResponse } from '../types/api';

import { httpClient } from './http-client';

export const authApi = {
  async login(payload: { username: string; password: string }) {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async me() {
    const { data } = await httpClient.get<{ user: AppUser }>('/auth/me');
    return data.user;
  },

  async logout() {
    await httpClient.post('/auth/logout');
  },
};
