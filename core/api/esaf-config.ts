export function requireEsafApiBaseUrl() {
  const value = process.env.EXPO_PUBLIC_ESAF_API_BASE_URL;
  if (!value) throw new Error('Missing env: EXPO_PUBLIC_ESAF_API_BASE_URL');
  return value;
}

export const ESAF_OAUTH_SCOPE = 'CRMMobileApp';

export const ESAF_OAUTH_GRANT_TYPE = 'client_credentials';

export function requireEsafOauthBasicAuth() {
  const value = 'Basic a2ZxZVYzUjV1eGZmc2huYVNhX2czckJtc3RZYTpja2l0d2FFYTYwQ05ac1kyUlZxbE0zQXA2UFFh';
  if (!value)
    throw new Error('Missing env: EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH');
  return value;
}


export const ESAF_DEFAULT_CHANNEL = 'API';
