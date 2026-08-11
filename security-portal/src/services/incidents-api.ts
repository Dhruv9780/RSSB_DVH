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
  image?: File;
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
    const formData = new FormData();

    formData.append('title', payload.title);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.categoryId !== undefined) {
      formData.append('categoryId', String(payload.categoryId));
    }
    formData.append('priority', payload.priority);
    formData.append('location', payload.location);
    formData.append('incidentDate', payload.incidentDate);
    formData.append('incidentTime', payload.incidentTime);
    formData.append('reporterName', payload.reporterName);
    formData.append('reporterContact', payload.reporterContact);
    formData.append('status', payload.status);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const { data } = await httpClient.post<{ incident: Incident }>('/incidents', formData);
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
};
