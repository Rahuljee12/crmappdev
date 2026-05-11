import type { Lead } from './lead';
import type { CreateLeadParams } from './create-lead-params';
import type { LeadListCriteria } from './lead-list-criteria';

export interface LeadRepository {
  listLeads(criteria: LeadListCriteria): Promise<Lead[]>;
  createLead(params: CreateLeadParams): Promise<void>;
}
