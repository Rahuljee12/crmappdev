import { useMutation } from '@tanstack/react-query';

import { customerUseCases } from '@/application/di/app-dependencies';
import type { CustomerSearchResult } from '@/domain/customers/customer-search-result';

export function useFindCustomerMutation() {
  return useMutation({
    mutationFn: (mobile: string) =>
      customerUseCases.findCustomerByMobile.execute(mobile) as Promise<CustomerSearchResult[]>,
  });
}
