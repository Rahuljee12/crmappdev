import { useMutation } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';

export function useGenerateAadhaarOtpMutation() {
  return useMutation({
    mutationFn: (params: { encryptedUid: string }) =>
      leadUseCases.generateAadhaarOtp.execute(params),
  });
}

