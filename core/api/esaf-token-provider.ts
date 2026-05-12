import {
  ESAF_OAUTH_GRANT_TYPE,
  ESAF_OAUTH_SCOPE,
  requireEsafApiBaseUrl,
  requireEsafOauthBasicAuth,
} from './esaf-config';
import { httpJson } from './http-json';
import { log } from '@/core/utils/logger';

type OAuthTokenResponseDto = {
  access_token: string;
  expires_in?: number;
};

type CachedToken = {
  accessToken: string;
  expiresAtMs: number;
};

let cachedToken: CachedToken | null = null;
let inFlight: Promise<string> | null = null;

function nowMs() {
  return Date.now();
}

export async function getEsafAccessToken(): Promise<string> {
  const cached = cachedToken;
  if (cached && cached.expiresAtMs > nowMs() + 15_000) {
    log.debug('[token] using cached token', { expiresAtMs: cached.expiresAtMs });
    return cached.accessToken;
  }

  if (inFlight) {
    log.debug('[token] awaiting inFlight token');
    return inFlight;
  }

  inFlight = (async () => {
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/token`;
    log.info('[token] requesting token', { url });
    const body = new URLSearchParams({
      grant_type: ESAF_OAUTH_GRANT_TYPE,
      scope: ESAF_OAUTH_SCOPE,
    });

    const dto = await httpJson<OAuthTokenResponseDto>(url, {
      method: 'POST',
      headers: {
        Authorization: requireEsafOauthBasicAuth(),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    }).catch((e: any) => {
      // Ensure we see server response on Android as well
      log.error('[token] token request failed', {
        url,
        error: e,
        status: e?.status,
        bodyText: e?.body,
        name: e?.name,
        message: e?.message,
      });
      throw e;
    });


    const accessToken = dto.access_token;
    const expiresIn = typeof dto.expires_in === 'number' ? dto.expires_in : 300;
    cachedToken = {
      accessToken,
      expiresAtMs: nowMs() + expiresIn * 1000,
    };
    log.info('[token] token received', { expiresInSeconds: expiresIn });
    return accessToken;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
