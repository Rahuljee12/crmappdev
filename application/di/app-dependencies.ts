import { CreateLead } from '@/application/leads/create-lead';
import { ListLeads } from '@/application/leads/list-leads';
import { LeadMemoryRepository } from '@/adapters/leads/lead-memory-repository';

const leadRepo = new LeadMemoryRepository();

export const leadUseCases = {
  listLeads: new ListLeads(leadRepo),
  createLead: new CreateLead(leadRepo),
};

export function addLead(lead: import('@/domain/leads/lead').Lead) {
  leadUseCases.createLead.execute(lead);
}


