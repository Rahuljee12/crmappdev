import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';

export class ListLeads {
  constructor(private readonly repo: LeadRepository) {}

  execute(): Lead[] {
    return this.repo.listLeads();
  }
}

