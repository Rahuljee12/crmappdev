import * as SecureStore from 'expo-secure-store';

const EKYC_AES_KEY = 'EKYC_AES_KEY';

export async function setEkycAesKey(key: string) {
  await SecureStore.setItemAsync(EKYC_AES_KEY, key);
}

export async function getEkycAesKey() {
  return SecureStore.getItemAsync(EKYC_AES_KEY);
}

export async function requireEkycAesKey() {
  let value = await getEkycAesKey();

  // Avoid production release failures due to missing initialization / init race:
  // if missing, try to bootstrap from env once and re-read.
  if (!value) {
    const { initializeEkycAesKeyFromBootstrapEnv } = await import('@/core/security/ekyc-init');
    await initializeEkycAesKeyFromBootstrapEnv();
    value = await getEkycAesKey();
  }

  if (!value) throw new Error('EKYC AES key not initialized');
  return value;
}

export async function clearEkycAesKey() {
  await SecureStore.deleteItemAsync(EKYC_AES_KEY);
}
