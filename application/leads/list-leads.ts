import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';
import type { LeadListCriteria } from '@/domain/leads/lead-list-criteria';

export class ListLeads {
  constructor(private readonly repo: LeadRepository) {}

  execute(criteria: LeadListCriteria): Promise<Lead[]> {
    return this.repo.listLeads(criteria);
  }
}
