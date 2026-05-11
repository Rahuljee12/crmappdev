export function requireEsafApiBaseUrl() {
  const value = process.env.EXPO_PUBLIC_ESAF_API_BASE_URL;
  if (!value) throw new Error('Missing env: EXPO_PUBLIC_ESAF_API_BASE_URL');
  return value;
}

export const ESAF_OAUTH_SCOPE =
  process.env.EXPO_PUBLIC_ESAF_OAUTH_SCOPE ?? 'CRMMobileApp';

export const ESAF_OAUTH_GRANT_TYPE = 'client_credentials';

export function requireEsafOauthBasicAuth() {
  const value = process.env.EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH;
  if (!value) throw new Error('Missing env: EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH');
  return value;
}

export const ESAF_DEFAULT_CHANNEL =
  process.env.EXPO_PUBLIC_ESAF_CHANNEL ?? 'API';
