import Constants from 'expo-constants';

function getEnv(name: string): string | undefined {
  return (
    process.env[name] ??
    Constants.expoConfig?.extra?.[name] ??
    undefined
  );
}

function requireEnv(name: string): string {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

export function requireEsafApiBaseUrl() {
  const value = process.env.EXPO_PUBLIC_ESAF_API_BASE_URL;
  if (!value) throw new Error('Missing env: EXPO_PUBLIC_ESAF_API_BASE_URL');
  return value;
}

export const ESAF_OAUTH_SCOPE = 'default';

export const ESAF_OAUTH_GRANT_TYPE = 'client_credentials';

export function requireEsafOauthBasicAuth() {
  const value = 'Basic RFZ1TzdsekZQWTBQVUJvRUtfSDFOa0VDdUJzYTozRHVhNWk2aXNxMFRQUWZrWVVwX2xUT3ZmaWNh';
  if (!value)
    throw new Error('Missing env: EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH');
  return value;
}


export const ESAF_DEFAULT_CHANNEL = 'API';
