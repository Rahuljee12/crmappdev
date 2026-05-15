import { useMutation } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';

export function useValidatePanMutation() {
  return useMutation({
    mutationFn: (params: { pan: string; name: string; fathername: string; dob: string }) =>
      leadUseCases.validatePan.execute(params),
  });
}

