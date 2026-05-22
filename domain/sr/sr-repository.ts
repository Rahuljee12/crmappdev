import type { CreateSrParams } from './create-sr-params';

export type CreateSrResult = {
  serviceRequestNumber: string;
  dateCreated?: string;
  statusMessage?: string;
};

export interface SrRepository {
  createServiceRequest(params: CreateSrParams): Promise<CreateSrResult>;
}

