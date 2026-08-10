import type { Category, Location } from '../types/api';

import { httpClient } from './http-client';

export const catalogApi = {
  async listCategories() {
    const { data } = await httpClient.get<{ categories: Category[] }>('/catalog/categories');
    return data.categories;
  },

  async listLocations() {
    const { data } = await httpClient.get<{ locations: Location[] }>('/catalog/locations');
    return data.locations;
  },

  async upsertCategory(payload: { name: string; description?: string; isActive?: boolean }) {
    const { data } = await httpClient.post<{ category: Category }>('/catalog/categories', payload);
    return data.category;
  },

  async upsertLocation(payload: { name: string; description?: string; isActive?: boolean }) {
    const { data } = await httpClient.post<{ location: Location }>('/catalog/locations', payload);
    return data.location;
  },
};