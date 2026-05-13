import { useMutation } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';

export function useSendLeadOtpMutation() {
  return useMutation({
    mutationFn: (params: { phone: string }) =>
      leadUseCases.sendLeadCreationOtp.execute(params),
  });
}


