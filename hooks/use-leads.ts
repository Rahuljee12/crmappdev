import { useQuery } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';
import { useLeadsCriteria } from './use-leads-criteria';
import { log } from '@/core/utils/logger';

export function useLeadsQuery() {
  const criteria = useLeadsCriteria();

  const enabled = Boolean(criteria.data?.mobileNumber);
  log.debug('[useLeadsQuery] enabled', enabled, 'criteria.data', criteria.data);

  return useQuery({
    queryKey: [
      'leads',
      criteria.data?.mobileNumber ?? null,
      criteria.data?.interestedProduct ?? null,
    ],
    queryFn: async () => {
      log.debug('[useLeadsQuery] queryFn start', { criteria: criteria.data });
      return leadUseCases.listLeads.execute(criteria.data!);
    },
    enabled,
  });
}

