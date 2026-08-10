import { httpClient } from './http-client';

export type CreateReturnInput = {
  foundItemId: number;
  lostReportId?: number;
  returnedTo: string;
  phoneNumber: string;
  identityVerified: boolean;
  returnDate: string;
  returnTime: string;
  remarks?: string;
};

export const returnsApi = {
  async create(payload: CreateReturnInput) {
    const { data } = await httpClient.post('/returns', payload);
    return data;
  },
};
