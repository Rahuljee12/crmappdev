import { useQuery, useQueryClient } from '@tanstack/react-query';

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
      if (!mobileNumber) {
        throw new Error('Missing env: EXPO_PUBLIC_ESAF_FETCH_MOBILE');
      }

      return {
        mobileNumber,
        emailAddress: process.env.EXPO_PUBLIC_ESAF_FETCH_EMAIL,
        interestedProduct: process.env.EXPO_PUBLIC_ESAF_FETCH_PRODUCT,
      };
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
