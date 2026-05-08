import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';

export class CreateLead {
  constructor(private readonly repo: LeadRepository) {}

  execute(params: Lead): void {
    this.repo.addLead(params);
  }
}

