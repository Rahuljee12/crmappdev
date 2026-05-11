import { useMutation } from '@tanstack/react-query';

import { customerUseCases } from '@/application/di/app-dependencies';

export function useFindCustomerMutation() {
  return useMutation({
    mutationFn: (mobile: string) =>
      customerUseCases.findCustomerByMobile.execute(mobile),
  });
}

