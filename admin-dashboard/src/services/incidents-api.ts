import type { Incident, IncidentPriority } from '../types/api';

import { httpClient } from './http-client';

export type CreateIncidentInput = {
  title: string;
  description?: string;
  categoryId?: number;
  priority: IncidentPriority;
  location: string;
  incidentDate: string;
  incidentTime: string;
  reporterName: string;
  reporterContact: string;
  status: 'OPEN';
};

export type ListIncidentsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  dateFrom?: string;
  dateTo?: string;
};

export type UpdateIncidentStatusInput = {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
};

export const incidentsApi = {
  async create(payload: CreateIncidentInput) {
    const { data } = await httpClient.post<{ incident: Incident }>('/incidents', payload);
    return data.incident;
  },

  async list(query: ListIncidentsQuery) {
    const { data } = await httpClient.get<{
      incidents: Incident[];
      pagination: { page: number; pageSize: number; total: number; totalPages: number };
    }>('/incidents', {
      params: query,
    });
    return data;
  },

  async updateStatus(incidentId: number, payload: UpdateIncidentStatusInput) {
    const { data } = await httpClient.patch<{ incident: Incident }>(`/incidents/${incidentId}/status`, payload);
    return data.incident;
  },

  async exportCsv(query: ListIncidentsQuery) {
    const { data } = await httpClient.get<Blob>('/incidents/export.csv', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },
};
