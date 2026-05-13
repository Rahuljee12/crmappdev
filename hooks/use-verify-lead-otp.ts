import { useMutation } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';

export function useVerifyLeadOtpMutation() {
  return useMutation({
    mutationFn: (params: {
      phone: string;
      otp: string;
      requestId: string;
    }) => leadUseCases.verifyLeadCreationOtp.execute(params),
  });
}


