import { getEkycAesKey, setEkycAesKey } from './ekyc-secure-storage';
import Constants from 'expo-constants';

function getEnv(name: string): string | undefined {
  return (
    process.env[name] ??
    (Constants.expoConfig?.extra?.[name] as string | undefined) ??
    undefined
  );
}

/**
 * One-time runtime initialization for EKYC AES key:
 * - If SecureStore already has a key, does nothing.
 * - Else, attempts to read a bootstrap key from env and stores it.
 *
 * NOTE: Bootstrap env is still bundled in JS if provided via EXPO_PUBLIC_*.
 * Use only for controlled builds or development; prefer provisioning from a secure backend.
 */
export async function initializeEkycAesKeyFromBootstrapEnv() {
  const existing = await getEkycAesKey();
  if (existing) return { initialized: true, source: 'secure_store' as const };

  // Backwards compatible: allow old EXPO_PUBLIC_EKYC_AES_KEY_BASE64 to bootstrap SecureStore.
  const bootstrap =
    getEnv('EXPO_PUBLIC_EKYC_AES_KEY_BOOTSTRAP_BASE64')?.trim() ||
    getEnv('EXPO_PUBLIC_EKYC_AES_KEY_BASE64')?.trim();
  if (!bootstrap) return { initialized: false, source: 'missing' as const };

  await setEkycAesKey(bootstrap);
  return {
    initialized: true,
    source: getEnv('EXPO_PUBLIC_EKYC_AES_KEY_BOOTSTRAP_BASE64') ? 'bootstrap_env' : 'legacy_env',
  } as const;
}
