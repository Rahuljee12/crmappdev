import type { CreateSrParams } from '@/domain/sr/create-sr-params';
import type { CreateSrResult, SrRepository } from '@/domain/sr/sr-repository';

export class CreateServiceRequest {
  constructor(private readonly repo: SrRepository) {}

  execute(params: CreateSrParams): Promise<CreateSrResult> {
    return this.repo.createServiceRequest(params);
  }
}

