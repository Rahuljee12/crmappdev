import { useQuery, useQueryClient } from '@tanstack/react-query';
import { log } from '@/core/utils/logger';

export type LeadsCriteria = {
  mobileNumber: string;
  emailAddress?: string;
  interestedProduct?: string;
};

export function useLeadsCriteria() {
  return useQuery({
    queryKey: ['leadsCriteria'],
    queryFn: async (): Promise<LeadsCriteria> => {
      const mobileNumber = process.env.EXPO_PUBLIC_ESAF_FETCH_MOBILE;
      log.debug('[leadsCriteria] env EXPO_PUBLIC_ESAF_FETCH_MOBILE', mobileNumber);

      if (!mobileNumber) {
        throw new Error('Missing env: EXPO_PUBLIC_ESAF_FETCH_MOBILE');
      }

      const criteria: LeadsCriteria = {
        mobileNumber,
        emailAddress: "",
        interestedProduct: process.env.EXPO_PUBLIC_ESAF_FETCH_PRODUCT,
      };

      log.debug('[leadsCriteria] criteria', criteria);
      return criteria;
    },
    staleTime: Infinity,
  });
}


export function useSetLeadsCriteria() {
  const qc = useQueryClient();
  return (criteria: LeadsCriteria) => {
    qc.setQueryData(['leadsCriteria'], criteria);
  };
}
