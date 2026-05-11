import { useLeadsQuery } from '@/hooks/use-leads';
import { createLead } from '@/application/di/app-dependencies';
import type { CreateLeadParams } from '@/domain/leads/create-lead-params';

export type { Lead, LeadStatus } from '@/domain/leads/lead';
export type { CreateLeadParams } from '@/domain/leads/create-lead-params';

export function useLeads() {
  const query = useLeadsQuery();
  return query.data ?? [];
}

export function addLead(params: CreateLeadParams) {
  return createLead(params);
}


