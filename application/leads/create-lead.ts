import type { CreateLeadParams } from '@/domain/leads/create-lead-params';
import type { LeadRepository } from '@/domain/leads/lead-repository';

export class CreateLead {
  constructor(private readonly repo: LeadRepository) {}

  execute(params: CreateLeadParams): Promise<string> {
    return this.repo.createLead(params);
  }
}
