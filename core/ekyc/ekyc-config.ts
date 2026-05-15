import Constants from 'expo-constants';

function getEnv(name: string): string | undefined {
  return process.env[name] ?? (Constants.expoConfig?.extra?.[name] as string | undefined) ?? undefined;
}

function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getUidaiCertCi() {
  return getEnv('EXPO_PUBLIC_UIDAI_CERT_CI') ?? '20280825';
}

export function requireEkycGenerateOtpTransactionInfo() {
  return {
    posEntryMode: requireEnv('EXPO_PUBLIC_EKYC_POS_ENTRY_MODE'),
    posCode: requireEnv('EXPO_PUBLIC_EKYC_POS_CODE'),
    caId: requireEnv('EXPO_PUBLIC_EKYC_CA_ID'),
    caTa: requireEnv('EXPO_PUBLIC_EKYC_CA_TA'),
  };
}

export function requireEkycAuthenticateTransactionInfo() {
  return {
    posEntryMode: requireEnv('EXPO_PUBLIC_EKYC_POS_ENTRY_MODE'),
    posCode: requireEnv('EXPO_PUBLIC_EKYC_POS_CODE'),
    caId: requireEnv('EXPO_PUBLIC_EKYC_AUTH_CA_ID'),
    caTa: requireEnv('EXPO_PUBLIC_EKYC_CA_TA'),
  };
}
