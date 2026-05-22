import { useMutation } from '@tanstack/react-query';
import { createServiceRequest } from '@/application/di/app-dependencies';
import type { CreateSrParams } from '@/domain/sr/create-sr-params';

export function useCreateSrMutation() {
  return useMutation({
    mutationFn: (params: CreateSrParams) => createServiceRequest(params),
  });
}

