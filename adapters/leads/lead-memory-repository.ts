import { useSyncExternalStore } from 'react';

import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';

const initialLeads: Lead[] = [
  {
    name: 'Vijay Krishnan',
    product: 'Home Loan',
    amount: '₹ 45 L',
    source: 'via Walk-in',
    time: 'Today, 4 PM',
    status: 'Hot',
  },
  {
    name: 'Lakshmi Iyer',
    product: 'CASA - Premium',
    amount: '₹ 2 L',
    source: 'via Referral',
    time: 'Tomorrow',
    status: 'Warm',
  },
  {
    name: 'Mohammed Ali',
    product: 'Business Loan',
    amount: '₹ 12 L',
    source: 'via Campaign',
    time: 'Today, 6 PM',
    status: 'Hot',
  },
];

let leads: Lead[] = [...initialLeads];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export class LeadMemoryRepository implements LeadRepository {
  listLeads(): Lead[] {
    return leads;
  }

  addLead(lead: Lead): void {
    leads = [lead, ...leads];
    emit();
  }
}

const leadMemoryRepository = new LeadMemoryRepository();

export function useLeadsFromMemory() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => leadMemoryRepository.listLeads(),
    () => leadMemoryRepository.listLeads(),
  );
}

