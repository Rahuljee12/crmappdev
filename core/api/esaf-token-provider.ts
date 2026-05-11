import {
  ESAF_OAUTH_GRANT_TYPE,
  ESAF_OAUTH_SCOPE,
  requireEsafApiBaseUrl,
  requireEsafOauthBasicAuth,
} from './esaf-config';
import { httpJson } from './http-json';

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
    return cached.accessToken;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const url = `${requireEsafApiBaseUrl()}/token`;
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
      body,
    });

    const accessToken = dto.access_token;
    const expiresIn = typeof dto.expires_in === 'number' ? dto.expires_in : 300;
    cachedToken = {
      accessToken,
      expiresAtMs: nowMs() + expiresIn * 1000,
    };
    return accessToken;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
