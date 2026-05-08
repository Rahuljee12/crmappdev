import type { Lead } from './lead';

export interface LeadRepository {
  listLeads(): Lead[];
  addLead(lead: Lead): void;
}

