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
  receiverPhoto?: File;
};

export const returnsApi = {
  async create(payload: CreateReturnInput) {
    const formData = new FormData();
    formData.append('foundItemId', String(payload.foundItemId));
    if (payload.lostReportId !== undefined) {
      formData.append('lostReportId', String(payload.lostReportId));
    }
    formData.append('returnedTo', payload.returnedTo);
    formData.append('phoneNumber', payload.phoneNumber);
    formData.append('identityVerified', String(payload.identityVerified));
    formData.append('returnDate', payload.returnDate);
    formData.append('returnTime', payload.returnTime);
    if (payload.remarks) {
      formData.append('remarks', payload.remarks);
    }
    if (payload.receiverPhoto) {
      formData.append('receiverPhoto', payload.receiverPhoto);
    }

    const { data } = await httpClient.post('/returns', formData);
    return data;
  },
};
