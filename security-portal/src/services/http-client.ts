import axios from 'axios';

import { env } from '../config/env';

let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
