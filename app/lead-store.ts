import { useLeadsFromMemory } from '@/adapters/leads/lead-memory-repository';

export type { Lead, LeadStatus } from '@/domain/leads/lead';

export function useLeads() {
  return useLeadsFromMemory();
}

export { addLead } from '@/application/di/app-dependencies';




