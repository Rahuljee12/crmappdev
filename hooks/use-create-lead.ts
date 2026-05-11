import { useMutation } from '@tanstack/react-query';

import { createLead, leadUseCases } from '@/application/di/app-dependencies';
import { queryClient } from '@/core/query/query-client';
import { useSetLeadsCriteria } from './use-leads-criteria';
import type { CreateLeadParams } from '@/domain/leads/create-lead-params';

function leadsKey(criteria: {
  mobileNumber: string;
  interestedProduct?: string;
}) {
  return ['leads', criteria.mobileNumber, criteria.interestedProduct ?? null] as const;
}

export function useCreateLeadMutation() {
  const setCriteria = useSetLeadsCriteria();

  return useMutation({
    mutationFn: (params: CreateLeadParams) => createLead(params),
    onSuccess: async (_data, variables) => {
      const criteria = {
        mobileNumber: variables.mobileNumber,
        emailAddress: variables.emailAddress,
        interestedProduct: variables.interestedProduct,
      };

      setCriteria(criteria);

      const data = await queryClient.fetchQuery({
        queryKey: leadsKey(criteria),
        queryFn: () => leadUseCases.listLeads.execute(criteria),
      });

      queryClient.setQueryData(leadsKey(criteria), data);
    },
  });
}

