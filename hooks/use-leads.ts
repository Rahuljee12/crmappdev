import { useQuery } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';
import { useLeadsCriteria } from './use-leads-criteria';

export function useLeadsQuery() {
  const criteria = useLeadsCriteria();

  return useQuery({
    queryKey: [
      'leads',
      criteria.data?.mobileNumber ?? null,
      criteria.data?.interestedProduct ?? null,
    ],
    queryFn: () => leadUseCases.listLeads.execute(criteria.data!),
    enabled: Boolean(criteria.data?.mobileNumber),
  });
}

