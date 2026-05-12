import { useEffect } from 'react';

import { getEsafAccessToken } from '@/core/api/esaf-token-provider';
import { queryClient } from '@/core/query/query-client';
import { log } from '@/core/utils/logger';

export function usePrefetchAuthToken() {
  useEffect(() => {
    log.info('[boot] prefetch token');
    queryClient.prefetchQuery({
      queryKey: ['esafToken'],
      queryFn: () => getEsafAccessToken(),
      staleTime: 4 * 60 * 1000,
    }).catch((e) => {
      log.warn('[boot] token prefetch failed', e);
    });
  }, []);
}
