import type { Category, Location } from '../types/api';

import { httpClient } from './http-client';

export const catalogApi = {
  async getCategories() {
    const { data } = await httpClient.get<{ categories: Category[] }>('/catalog/categories');
    return data.categories;
  },

  async getLocations() {
    const { data } = await httpClient.get<{ locations: Location[] }>('/catalog/locations');
    return data.locations;
  },
};
