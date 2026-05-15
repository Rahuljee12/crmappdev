import { useMutation } from '@tanstack/react-query';

import { leadUseCases } from '@/application/di/app-dependencies';

export function useAuthenticateAadhaarOtpMutation() {
  return useMutation({
    mutationFn: (params: {
      encryptedUid: string;
      txn: string;
      auth?: {
        skey?: { ci?: string; value?: string };
        data?: { type?: string; value?: string };
        hmac?: string;
      };
    }) =>
      leadUseCases.authenticateAadhaarOtp.execute(params),
  });
}
